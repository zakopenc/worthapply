# AI Chat Bot - Quick Start Guide

**Ready to implement in 30 minutes** ⚡

---

## 🚀 Step-by-Step Implementation

### Step 1: Install Packages (2 minutes)

```bash
cd /home/zak/projects/worthapply
npm install ai @ai-sdk/openai
npm install @radix-ui/react-dialog @radix-ui/react-scroll-area
```

### Step 2: Add API Key (1 minute)

Add to `.env.local`:
```env
OPENAI_API_KEY=sk-proj-your-key-here
```

Get your key from: https://platform.openai.com/api-keys

### Step 3: Create API Route (5 minutes)

Create `src/app/api/chat/route.ts`:

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a helpful support agent for WorthApply, a job application optimization platform.

**Key Features:**
- Job Fit Analysis: AI analyzes if a job is worth applying to
- Resume Tailoring: AI customizes resumes for each job in 60 seconds
- ATS Checker: Free unlimited scans to check resume compatibility
- Application Tracker: Organize all job applications

**Pricing:**
- Free: 5 job analyses, limited features
- Pro: $29/month, unlimited everything

Be friendly, helpful, and guide users to signup or try the free tier.
Answer questions about features, pricing, and how to use the platform.`,
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Step 4: Create Chat Widget (10 minutes)

Create `src/components/ChatWidget.tsx`:

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { MessageCircle, X, Send } from 'lucide-react';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-on-primary rounded-full p-4 shadow-lg hover:bg-primary/90 transition-all z-50 hover:scale-110"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Chat Panel */}
          <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[400px] h-[100vh] md:h-[600px] bg-surface md:rounded-2xl shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/10 bg-gradient-to-r from-primary/10 to-secondary/10">
              <div>
                <h3 className="font-bold text-on-surface">WorthApply Support</h3>
                <p className="text-sm text-on-surface/60">We're here to help! 👋</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-on-surface/60 hover:text-on-surface transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-on-surface/60 py-8">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="font-semibold mb-2">Hi! How can I help you today?</p>
                  <div className="space-y-2 mt-4">
                    <button
                      onClick={() => {
                        handleInputChange({ target: { value: "How does job fit analysis work?" } } as any);
                      }}
                      className="block w-full text-left px-4 py-2 bg-surface-container rounded-lg hover:bg-surface-container/80 text-sm"
                    >
                      How does job fit analysis work?
                    </button>
                    <button
                      onClick={() => {
                        handleInputChange({ target: { value: "What's included in the Pro plan?" } } as any);
                      }}
                      className="block w-full text-left px-4 py-2 bg-surface-container rounded-lg hover:bg-surface-container/80 text-sm"
                    >
                      What's included in the Pro plan?
                    </button>
                    <button
                      onClick={() => {
                        handleInputChange({ target: { value: "How do I get started?" } } as any);
                      }}
                      className="block w-full text-left px-4 py-2 bg-surface-container rounded-lg hover:bg-surface-container/80 text-sm"
                    >
                      How do I get started?
                    </button>
                  </div>
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
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-outline-variant/10">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-3 bg-surface-container rounded-xl text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-3 bg-primary text-on-primary rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-xs text-on-surface/40 mt-2 text-center">
                Powered by AI • Responses may take a few seconds
              </p>
            </form>
          </div>
        </>
      )}
    </>
  );
}
```

### Step 5: Add to Your Layout (2 minutes)

Update `src/app/layout.tsx` - add the import and component:

```typescript
import { ChatWidget } from '@/components/ChatWidget';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatWidget />  {/* Add this line */}
      </body>
    </html>
  );
}
```

### Step 6: Test It! (5 minutes)

```bash
npm run dev
```

Open http://localhost:3000 and you should see the chat button in the bottom-right corner!

---

## ✅ That's It!

You now have a working AI chat support bot!

### What You Just Built:
- ✅ Floating chat button (bottom-right)
- ✅ Beautiful chat interface
- ✅ Real-time streaming responses
- ✅ Suggested questions for first-time users
- ✅ Mobile-responsive design
- ✅ Smooth animations

### Cost:
- **Per conversation**: ~$0.001 (one-tenth of a cent)
- **100 conversations**: $0.10
- **1,000 conversations**: $1.00

---

## 🎨 Customization Ideas

### Change the Button Position:
```typescript
// Top-right instead of bottom-right
className="fixed top-6 right-6..."
```

### Change the Icon:
```typescript
import { MessageSquare, HelpCircle, Zap } from 'lucide-react';
<MessageSquare size={24} />
```

### Add More Suggested Questions:
```typescript
const SUGGESTED_QUESTIONS = [
  "How does job fit analysis work?",
  "What's included in the Pro plan?",
  "How do I get started?",
  "Do you have a free trial?",
  "How accurate is the ATS checker?",
];
```

### Customize the System Prompt:
Edit the `system` message in `src/app/api/chat/route.ts` to change how the bot responds.

---

## 🐛 Troubleshooting

### "Module not found: Can't resolve 'ai'"
```bash
npm install ai @ai-sdk/openai --force
rm -rf .next
npm run dev
```

### "OpenAI API key not found"
Make sure `.env.local` has:
```env
OPENAI_API_KEY=sk-proj-...
```
Restart dev server after adding env variables.

### Chat button not showing
Check that `<ChatWidget />` is added to your layout.tsx file.

### Responses are slow
This is normal for first response (cold start). Subsequent responses are faster.
You can upgrade to GPT-4 for better responses (but higher cost).

---

## 🚀 Next Steps (Optional)

### Add Supabase Integration:
Save chat history to database (see full plan: AI_CHAT_IMPLEMENTATION_PLAN.md)

### Add User Context:
Show different responses for logged-in users vs visitors

### Add Analytics:
Track which questions are most common

### Add Handoff to Human:
Let users request human support if AI can't help

---

## 📊 Monitor Usage

Check your OpenAI usage at:
https://platform.openai.com/usage

Set spending limits to avoid surprises!

---

**Total Setup Time**: ~30 minutes  
**Monthly Cost**: $5-20 for early-stage traffic  
**Maintenance**: Check OpenAI dashboard monthly

Questions? The AI can answer most of them now! 😄
