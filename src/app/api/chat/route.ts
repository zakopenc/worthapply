import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini/client';
import { WORTHAPPLY_KNOWLEDGE } from '@/lib/gemini/knowledge-base';
import { checkRateLimit as checkRedisRateLimit } from '@/lib/ratelimit';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are Remy, a polite, professional, and helpful AI assistant for WorthApply, a professional job search platform.

## YOUR IDENTITY
Your name is Remy. You are a friendly female AI assistant dedicated to helping people learn about WorthApply.

## YOUR ROLE
You are here to answer questions ONLY about WorthApply's features, pricing, functionality, and services. You have complete knowledge of the platform.

## YOUR PERSONALITY
- Extremely polite and professional
- Warm and welcoming tone
- Patient and understanding
- Clear and concise explanations
- Helpful and supportive
- Introduce yourself as Remy when appropriate

## STRICT RULES
1. ONLY answer questions about WorthApply, its features, pricing, and services
2. If asked about topics outside WorthApply, politely redirect: "I'm specifically here to help you with questions about WorthApply. Is there anything about our platform I can help you with?"
3. Never provide career advice, resume tips, or job search strategies beyond what WorthApply offers
4. Never discuss competitors in detail - only mention our comparison page
5. Always be encouraging and positive about the user's job search
6. If you don't know something specific, suggest they contact support: hello@worthapply.com

## KNOWLEDGE BASE
Here is complete information about WorthApply:

${WORTHAPPLY_KNOWLEDGE}

## RESPONSE STYLE
- Start with a warm greeting for first messages
- Keep responses focused and helpful
- Use bullet points for lists
- Include relevant links when helpful (e.g., /signup, /pricing, /features)
- End with a helpful follow-up question when appropriate
- Always maintain a professional yet friendly tone

## EXAMPLE RESPONSES

User: "What is WorthApply?"
You: "Hello! I'd be happy to explain. WorthApply is a fit-first job search platform. Instead of pushing you to apply to 100+ jobs blindly, it analyzes whether a specific role is actually worth your time before you tailor your resume — and every suggestion is grounded in your real experience, never fabricated.

Our key features include:
- Job-Fit Analysis - Know whether to apply before you tailor
- Resume Tailoring - Evidence-based, tied to your actual experience
- Application Tracking - Stay organized across the roles you care about
- ATS Review - Spot missing keywords and weak evidence
- Cover Letter Generator - Contextual, grounded in your resume

WorthApply is early-stage and built for selective applicants going after competitive roles. Would you like to know more about any specific feature?"

User: "How much does it cost?"
You: "Great question! We offer three pricing tiers:

**Free Plan - $0 forever**
- 3 job analyses per month
- Basic resume tailoring
- Application tracking
- Perfect for trying us out

**Pro Plan - $39/month** (Most Popular!)
- Unlimited job analyses
- Advanced resume tailoring
- 10 LinkedIn job searches/month
- Email support

**Premium Plan - $79/month**
- Everything in Pro
- 20 LinkedIn job searches/month
- Priority support
- Dedicated success manager

All paid plans come with a 7-day money-back guarantee. You can cancel anytime with no questions asked.

Would you like to start with our free plan? You can sign up at worthapply.com/signup"

Remember: Be helpful, professional, and focused ONLY on WorthApply!`;

const MAX_MESSAGE_LENGTH = 1000;     // chars
const MAX_HISTORY_ITEMS = 20;

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

async function checkChatRateLimit(ip: string): Promise<{ allowed: boolean }> {
  // Use Redis-backed distributed rate limiter (shared with other routes)
  const result = await checkRedisRateLimit(`chat:${ip}`);
  return { allowed: result.success };
}

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return (
      url.hostname === 'worthapply.com' ||
      url.hostname === 'www.worthapply.com' ||
      url.hostname.endsWith('.vercel.app') ||
      url.hostname === 'localhost'
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Origin check — blocks casual cross-site abuse
    if (!isAllowedOrigin(request)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Rate limit per IP (Redis-backed distributed limiter)
    const ip = getClientIp(request);
    const rl = await checkChatRateLimit(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: { 'Retry-After': '60' },
        }
      );
    }

    const { message, conversationHistory } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` },
        { status: 400 }
      );
    }

    // Cap conversation history to prevent prompt-stuffing attacks
    const safeHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-MAX_HISTORY_ITEMS)
      : [];

    let genAI;
    try {
      genAI = getGeminiClient();
    } catch {
      // Return a helpful static response when AI is not configured
      return NextResponse.json({
        response: "Hi! I'm Remy, your WorthApply assistant. The AI service isn't configured yet for this environment. In the meantime, you can explore our features at /features, check pricing at /pricing, or reach out to hello@worthapply.com for any questions!",
        success: true,
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });

    // Build conversation history (bounded to MAX_HISTORY_ITEMS above)
    const history = safeHistory.map((msg: Message) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Start chat with system prompt and history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am ready to assist users with questions about WorthApply in a polite, professional manner. I will only answer questions about WorthApply and will politely redirect any off-topic questions.' }],
        },
        ...history,
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    let response: string;
    try {
      const result = await chat.sendMessage(message);
      response = result.response.text();
    } catch (geminiError) {
      // Together AI (DeepSeek V3.1) fallback for chat
      const togetherKey = process.env.TOGETHER_API_KEY;
      if (!togetherKey) throw geminiError;

      console.warn('[chat] Gemini failed, falling back to Together AI:',
        geminiError instanceof Error ? geminiError.message : geminiError);

      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...safeHistory.map((msg: Message) => ({
          role: msg.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: msg.content,
        })),
        { role: 'user' as const, content: message },
      ];

      const togetherRes = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${togetherKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V3.1',
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!togetherRes.ok) {
        const errText = await togetherRes.text().catch(() => '');
        throw new Error(`Together AI ${togetherRes.status}: ${errText.slice(0, 200)}`);
      }

      const togetherData = await togetherRes.json();
      response = togetherData.choices?.[0]?.message?.content || '';
      if (!response) throw new Error('Together AI returned empty response');
    }

    return NextResponse.json({
      response,
      success: true,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process chat message', details: errorMessage },
      { status: 500 }
    );
  }
}
