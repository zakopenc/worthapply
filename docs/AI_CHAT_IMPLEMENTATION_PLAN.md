# AI Chat Support Bot Implementation Plan for WorthApply

**Date**: April 6, 2026  
**Project**: WorthApply - Job Application SaaS  
**Stack**: Next.js 15 + Supabase + Tailwind CSS

---

## 🎯 Goal

Add a smart AI-powered chat support bot that can:
- Answer questions about features, pricing, and how to use WorthApply
- Handle both anonymous visitors and authenticated users
- Store chat history in Supabase
- Provide context-aware responses based on user state
- Look professional and match WorthApply's design system

---

## 🔍 Solution Comparison

### Option 1: **OpenAI Assistants API + Custom Widget** ⭐ RECOMMENDED

**Best for**: Full control, custom branding, cost-effective

#### Pros:
- ✅ Full control over UI/UX
- ✅ Matches your existing design system
- ✅ Cheapest option (~$0.01-0.05 per conversation)
- ✅ Can integrate with your existing Supabase data
- ✅ Train on your documentation/FAQs
- ✅ No vendor lock-in

#### Cons:
- ⚠️ Requires custom development (~4-6 hours)
- ⚠️ Need to handle state management yourself
- ⚠️ Requires OpenAI API key

#### Cost:
- **Development**: 4-6 hours
- **Runtime**: ~$0.01-0.05 per conversation (OpenAI API)
- **Total Month 1**: $5-20 (assuming 100-500 conversations)

#### Implementation:
```bash
npm install openai ai @ai-sdk/openai
npm install @radix-ui/react-dialog @radix-ui/react-scroll-area
```

---

### Option 2: **Crisp Chat + AI Features**

**Best for**: Quick setup, managed service

#### Pros:
- ✅ 5-minute setup
- ✅ Beautiful pre-built widget
- ✅ Built-in AI chatbot features
- ✅ Live chat + chatbot hybrid
- ✅ Mobile app for team responses
- ✅ CRM features included

#### Cons:
- ⚠️ Monthly subscription required
- ⚠️ Less customization
- ⚠️ External service (privacy considerations)

#### Cost:
- **Free tier**: Basic chat (no AI)
- **Pro plan**: $25/mo per seat (includes AI)
- **Total Month 1**: $25/mo

#### Implementation:
```bash
npm install @crisp/crisp-sdk-web
```

---

### Option 3: **Intercom**

**Best for**: Enterprise features, scaling

#### Pros:
- ✅ Most mature platform
- ✅ Advanced automation
- ✅ Product tours
- ✅ Email campaigns
- ✅ Help center

#### Cons:
- ⚠️ Expensive ($74/mo minimum)
- ⚠️ Overkill for early-stage
- ⚠️ Complex setup

#### Cost:
- **Starter**: $74/mo
- **Total Month 1**: $74/mo

#### Implementation:
```bash
npm install @intercom/messenger-js-sdk
```

---

### Option 4: **Vercel AI SDK + Custom Widget** 🎯 BEST VALUE

**Best for**: Modern stack integration, streaming responses

#### Pros:
- ✅ Native Next.js integration
- ✅ Streaming UI (tokens appear in real-time)
- ✅ Works with multiple AI providers (OpenAI, Anthropic, etc.)
- ✅ Built for Next.js App Router
- ✅ Free SDK, only pay for AI usage
- ✅ React hooks for easy state management

#### Cons:
- ⚠️ Custom UI development needed
- ⚠️ No built-in analytics dashboard

#### Cost:
- **Development**: 3-4 hours
- **Runtime**: ~$0.01-0.05 per conversation
- **Total Month 1**: $5-20

#### Implementation:
```bash
npm install ai @ai-sdk/openai
```

---

## 🏆 Recommended Solution

**Vercel AI SDK + Custom Widget** (Option 4)

### Why?
1. **Cost-effective**: Only pay for AI usage (~$5-20/mo)
2. **Modern**: Built specifically for Next.js 15 App Router
3. **Streaming**: Real-time token streaming for better UX
4. **Flexible**: Supports OpenAI, Anthropic, Google, etc.
5. **Control**: Full customization to match your design
6. **Future-proof**: Easy to switch AI providers

---

## 📦 Implementation Plan

### Phase 1: Basic Chat Widget (2-3 hours)

#### Step 1: Install Dependencies
```bash
cd /home/zak/projects/worthapply
npm install ai @ai-sdk/openai
npm install @radix-ui/react-dialog @radix-ui/react-scroll-area lucide-react
```

#### Step 2: Add OpenAI API Key to Environment
Add to `.env.local`:
```env
OPENAI_API_KEY=sk-...your-key-here
```

#### Step 3: Create Chat API Route
Create `src/app/api/chat/route.ts`:
```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'), // Cost-effective model
    system: `You are a helpful support agent for WorthApply, a job application optimization platform.

Key features to mention:
- Job Fit Analysis: AI analyzes if a job is worth applying to before you waste time
- Resume Tailoring: AI customizes your resume for each job in 60 seconds
- ATS Checker: Free unlimited scans to ensure your resume passes applicant tracking systems
- Application Tracker: Organize all your job applications in one place

Pricing:
- Free tier: 5 job analyses, limited features
- Pro plan: $29/month, unlimited analyses + tailoring + tracking

Be helpful, friendly, and guide users to try the free tier or signup.`,
    messages,
  });

  return result.toDataStreamResponse();
}
```

#### Step 4: Create Chat Widget Component
Create `src/components/ChatWidget.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { MessageCircle, X, Send } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as ScrollArea from '@radix-ui/react-scroll-area';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Floating Button */}
      <Dialog.Trigger className="fixed bottom-6 right-6 bg-primary text-on-primary rounded-full p-4 shadow-lg hover:bg-primary/90 transition-all z-50">
        <MessageCircle size={24} />
      </Dialog.Trigger>

      {/* Chat Dialog */}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-surface rounded-2xl shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-outline-variant/10">
            <div>
              <h3 className="font-bold text-on-surface">WorthApply Support</h3>
              <p className="text-sm text-on-surface/60">Ask us anything!</p>
            </div>
            <Dialog.Close className="text-on-surface/60 hover:text-on-surface">
              <X size={20} />
            </Dialog.Close>
          </div>

          {/* Messages */}
          <ScrollArea.Root className="flex-1 overflow-hidden">
            <ScrollArea.Viewport className="h-full p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-on-surface/60 py-8">
                  <p>👋 Hi! How can I help you today?</p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container text-on-surface rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-on-surface/40 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-on-surface/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-on-surface/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical">
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-outline-variant/10">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 bg-surface-container rounded-xl text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-primary text-on-primary rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

#### Step 5: Add to Layout
Update `src/app/layout.tsx`:
```typescript
import { ChatWidget } from '@/components/ChatWidget';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
```

---

### Phase 2: Supabase Integration (1-2 hours)

#### Step 1: Create Chat History Table
Run in Supabase SQL Editor:
```sql
-- Create chat_conversations table
create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_messages table
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.chat_conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- RLS Policies
create policy "Users can view their own conversations"
  on public.chat_conversations for select
  using (auth.uid() = user_id or user_id is null);

create policy "Users can insert their own conversations"
  on public.chat_conversations for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can view their own messages"
  on public.chat_messages for select
  using (
    conversation_id in (
      select id from public.chat_conversations
      where user_id = auth.uid() or user_id is null
    )
  );

create policy "Users can insert their own messages"
  on public.chat_messages for insert
  with check (
    conversation_id in (
      select id from public.chat_conversations
      where user_id = auth.uid() or user_id is null
    )
  );

-- Indexes
create index chat_conversations_user_id_idx on public.chat_conversations(user_id);
create index chat_messages_conversation_id_idx on public.chat_messages(conversation_id);
```

#### Step 2: Update API Route to Save Messages
Update `src/app/api/chat/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { messages, conversationId } = await req.json();
  const supabase = await createClient();
  
  // Get current user (if authenticated)
  const { data: { user } } = await supabase.auth.getUser();
  
  // Create or get conversation
  let convId = conversationId;
  if (!convId) {
    const { data: conv } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user?.id || null,
        session_id: req.headers.get('x-session-id') || crypto.randomUUID(),
      })
      .select()
      .single();
    convId = conv?.id;
  }
  
  // Save user message
  await supabase.from('chat_messages').insert({
    conversation_id: convId,
    role: 'user',
    content: messages[messages.length - 1].content,
  });
  
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `...`, // Same as before
    messages,
    onFinish: async (result) => {
      // Save assistant response
      await supabase.from('chat_messages').insert({
        conversation_id: convId,
        role: 'assistant',
        content: result.text,
      });
    },
  });
  
  return result.toDataStreamResponse();
}
```

---

### Phase 3: Advanced Features (Optional, 2-3 hours)

#### Feature 1: Context-Aware Responses
Add user context to system prompt:
```typescript
const { data: user } = await supabase.auth.getUser();
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', user?.id)
  .single();

const systemPrompt = `You are a support agent for WorthApply.

User context:
${user ? `- Authenticated user: ${user.email}` : '- Anonymous visitor'}
${subscription ? `- Plan: ${subscription.plan}` : '- Plan: Free tier'}

Tailor your responses based on the user's plan...`;
```

#### Feature 2: Suggested Questions
Add quick reply buttons:
```typescript
const SUGGESTED_QUESTIONS = [
  "How does job fit analysis work?",
  "What's included in the Pro plan?",
  "How do I get started?",
  "Do you have a free trial?",
];
```

#### Feature 3: Analytics
Track chat metrics:
```sql
-- Add analytics table
create table public.chat_analytics (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.chat_conversations(id),
  event_type text not null,
  metadata jsonb,
  created_at timestamp with time zone default now()
);
```

---

## 💰 Cost Breakdown

### Recommended Solution (Vercel AI SDK + OpenAI)

#### Development Costs:
- Phase 1 (Basic Widget): 2-3 hours
- Phase 2 (Supabase Integration): 1-2 hours
- Phase 3 (Advanced Features): 2-3 hours (optional)
- **Total Development**: 3-8 hours

#### Monthly Running Costs:
- **GPT-4o-mini**: $0.15 per 1M input tokens, $0.60 per 1M output tokens
- **Average conversation**: ~500 tokens input + 1,500 tokens output = $0.001
- **100 conversations/month**: $0.10
- **500 conversations/month**: $0.50
- **1,000 conversations/month**: $1.00

**Estimated Month 1**: $5-20 (including testing and overhead)

---

## 🚀 Quick Start (Minimal Setup)

If you want to start today with minimal code:

### Option: Use Vercel AI Chatbot Template
```bash
npx create-next-app@latest worthapply-chat --example https://github.com/vercel/ai-chatbot
```

Then customize and integrate into your existing app.

---

## ✅ Implementation Checklist

### Prerequisites:
- [ ] Get OpenAI API key
- [ ] Add OPENAI_API_KEY to .env.local
- [ ] Install required packages

### Phase 1 (Basic Chat):
- [ ] Create API route (/api/chat)
- [ ] Create ChatWidget component
- [ ] Add to layout
- [ ] Test basic conversations
- [ ] Customize system prompt with WorthApply info

### Phase 2 (Supabase):
- [ ] Create database tables
- [ ] Update API to save messages
- [ ] Test conversation persistence
- [ ] Add user context awareness

### Phase 3 (Polish):
- [ ] Add suggested questions
- [ ] Add typing indicators
- [ ] Add analytics tracking
- [ ] Mobile responsive testing
- [ ] Add conversation history UI

---

## 📚 Resources

- **Vercel AI SDK Docs**: https://sdk.vercel.ai/docs
- **OpenAI API**: https://platform.openai.com/docs
- **Radix UI**: https://www.radix-ui.com/
- **Example Projects**: https://github.com/vercel/ai-chatbot

---

## 🎯 Next Steps

1. **Review this plan** and decide which phase to start with
2. **Get OpenAI API key** from platform.openai.com
3. **Start with Phase 1** (basic chat widget)
4. **Test thoroughly** before adding to production
5. **Monitor costs** in OpenAI dashboard

---

**Estimated Timeline**: 1-2 days for full implementation  
**Estimated Cost**: $5-20/month for 100-500 conversations  
**Complexity**: Medium (requires custom development)  
**Maintenance**: Low (mostly just monitoring costs)

Let me know which phase you'd like to start with!
