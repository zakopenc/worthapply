import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-3.1-pro-preview';
const TOGETHER_MODEL_NAME = 'deepseek-ai/DeepSeek-V3.1';
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

let genAI: GoogleGenerativeAI | null = null;
let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

export function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function getModel() {
  if (!model) {
    const client = getGeminiClient();
    model = client.getGenerativeModel({ model: MODEL_NAME });
  }

  return model;
}

function extractJsonPayload(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith('```')) {
    const fenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    return fenced.trim();
  }

  return trimmed;
}

const GEMINI_TIMEOUT_MS = 60_000; // 60 seconds
const TOGETHER_TIMEOUT_MS = 90_000; // 90 seconds (DeepSeek can be slower)

function withTimeout<T>(promise: Promise<T>, ms: number, label = 'API'): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

// ─── Together AI (DeepSeek V3.1) Fallback ─────────────────────────────────

interface TogetherCompletionResponse {
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

async function callTogether(prompt: string, jsonMode = false): Promise<string> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    throw new Error('TOGETHER_API_KEY is not set — cannot use fallback');
  }

  const body: Record<string, unknown> = {
    model: TOGETHER_MODEL_NAME,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 8192,
  };

  // DeepSeek V3.1 supports JSON mode via response_format
  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TOGETHER_TIMEOUT_MS);

  try {
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Together AI returned ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const data = (await response.json()) as TogetherCompletionResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Together AI returned empty response');
    }

    return content;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Unified API: Gemini primary, Together AI fallback ─────────────────────

function shouldFallback(error: unknown): boolean {
  if (!process.env.TOGETHER_API_KEY) return false;

  const message = error instanceof Error ? error.message : String(error);

  // Fall back for rate limits, server errors, timeouts, and model unavailability
  return (
    /timed out/i.test(message) ||
    /\b(429|500|502|503|504)\b/.test(message) ||
    /rate.?limit/i.test(message) ||
    /overloaded/i.test(message) ||
    /quota/i.test(message) ||
    /model.{0,20}not.{0,10}found/i.test(message) ||
    /unavailable/i.test(message) ||
    /ECONNRESET|ETIMEDOUT|ENETUNREACH|ENOTFOUND/i.test(message)
  );
}

function parseJsonResponse<T>(text: string): T {
  const cleaned = extractJsonPayload(text);

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');
    return JSON.parse(jsonMatch[0]) as T;
  }
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  try {
    const geminiModel = getModel();
    const result = await withTimeout(
      geminiModel.generateContent(prompt),
      GEMINI_TIMEOUT_MS,
      'Gemini'
    );
    return parseJsonResponse<T>(result.response.text());
  } catch (primaryError) {
    if (!shouldFallback(primaryError)) throw primaryError;

    console.warn(
      '[ai] Gemini failed, falling back to Together AI (DeepSeek V3.1):',
      primaryError instanceof Error ? primaryError.message : primaryError
    );

    try {
      const text = await callTogether(prompt, true);
      return parseJsonResponse<T>(text);
    } catch (fallbackError) {
      console.error('[ai] Both Gemini and Together AI failed:', fallbackError);
      throw primaryError; // surface the original Gemini error to the caller
    }
  }
}

export async function generateText(prompt: string): Promise<string> {
  try {
    const geminiModel = getModel();
    const result = await withTimeout(
      geminiModel.generateContent(prompt),
      GEMINI_TIMEOUT_MS,
      'Gemini'
    );
    return result.response.text();
  } catch (primaryError) {
    if (!shouldFallback(primaryError)) throw primaryError;

    console.warn(
      '[ai] Gemini failed, falling back to Together AI (DeepSeek V3.1):',
      primaryError instanceof Error ? primaryError.message : primaryError
    );

    try {
      return await callTogether(prompt, false);
    } catch (fallbackError) {
      console.error('[ai] Both Gemini and Together AI failed:', fallbackError);
      throw primaryError;
    }
  }
}
