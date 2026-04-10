'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Minus, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);

      if (isMinimized) setHasUnread(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment or contact us at hello@worthapply.com for immediate assistance.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 96) + 'px';
    }
  };

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasUnread(false);
  };

  const quickActions = [
    { label: 'Features', msg: 'What features does WorthApply offer?' },
    { label: 'Pricing', msg: 'What are your pricing plans?' },
    { label: 'How it works', msg: 'How does WorthApply work?' },
  ];

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Chat with Remy"
        >
          <div className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-[#84523c] to-[#C68A71] pl-1.5 pr-5 py-1.5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.03]">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white/30 flex-shrink-0">
              <Image
                src="/remy-avatar.svg"
                alt="Remy"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-white text-sm font-semibold whitespace-nowrap">
              Ask Remy
            </span>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-400 border-2 border-white" />
            </span>
          </div>
        </button>
      )}

      {/* Minimized bar */}
      {isOpen && isMinimized && (
        <button
          onClick={() => { setIsMinimized(false); setHasUnread(false); }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-[#84523c] to-[#C68A71] pl-1.5 pr-5 py-1.5 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.03]"
          aria-label="Expand chat"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white/30 flex-shrink-0">
            <Image src="/remy-avatar.svg" alt="Remy" fill className="object-cover" />
          </div>
          <span className="text-white text-sm font-semibold">Remy</span>
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
              !
            </span>
          )}
        </button>
      )}

      {/* Chat window */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[380px] h-[560px] rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/10 bg-surface-container-lowest animate-[slideUp_0.25s_ease-out]">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#84523c] to-[#C68A71] px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white/30 shadow-md flex-shrink-0">
                  <Image
                    src="/remy-avatar.svg"
                    alt="Remy"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-[15px]">Remy</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold text-white/90 uppercase tracking-wider">
                      <Sparkles className="h-2.5 w-2.5" /> AI
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
                    <p className="text-[11px] text-white/80 font-medium">Online now</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
                  aria-label="Minimize chat"
                >
                  <Minus className="h-4 w-4 text-white/80" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4 text-white/80" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#faf8f5]">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="space-y-4">
                {/* Intro card */}
                <div className="flex gap-2.5">
                  <div className="relative h-8 w-8 overflow-hidden rounded-full flex-shrink-0 mt-0.5">
                    <Image src="/remy-avatar.svg" alt="Remy" fill className="object-cover" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-outline-variant/10 max-w-[85%]">
                    <p className="text-sm text-on-surface leading-relaxed">
                      Hi there! I&apos;m <strong>Remy</strong>, your WorthApply assistant. I can help you with questions about our features, pricing, and how we help you land the right roles.
                    </p>
                  </div>
                </div>

                {/* Quick action chips */}
                <div className="pl-10">
                  <p className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-wider mb-2">Popular questions</p>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => {
                          setInputValue(action.msg);
                          setTimeout(() => {
                            setInputValue('');
                            setMessages([{ role: 'user', content: action.msg }]);
                            setIsLoading(true);
                            fetch('/api/chat', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ message: action.msg, conversationHistory: [] }),
                            })
                              .then((r) => r.json())
                              .then((data) => {
                                setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
                              })
                              .catch(() => {
                                setMessages((prev) => [
                                  ...prev,
                                  { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
                                ]);
                              })
                              .finally(() => setIsLoading(false));
                          }, 0);
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-secondary/5 hover:border-secondary/30 hover:text-secondary transition-all duration-200"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="relative h-7 w-7 overflow-hidden rounded-full flex-shrink-0 mt-0.5">
                    <Image src="/remy-avatar.svg" alt="Remy" fill className="object-cover" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#84523c] to-[#9e6a52] text-white rounded-2xl rounded-tr-md shadow-sm'
                      : 'bg-white text-on-surface rounded-2xl rounded-tl-md shadow-sm border border-outline-variant/10'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="relative h-7 w-7 overflow-hidden rounded-full flex-shrink-0 mt-0.5">
                  <Image src="/remy-avatar.svg" alt="Remy" fill className="object-cover" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-outline-variant/10">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-secondary/40 animate-[bounce_1.2s_infinite_0ms]" />
                    <span className="h-2 w-2 rounded-full bg-secondary/40 animate-[bounce_1.2s_infinite_200ms]" />
                    <span className="h-2 w-2 rounded-full bg-secondary/40 animate-[bounce_1.2s_infinite_400ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-outline-variant/15 bg-white px-4 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleTextareaInput}
                placeholder="Type your message..."
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-outline-variant/30 bg-surface-container-low px-3.5 py-2.5 text-[13px] text-on-surface placeholder-on-surface-variant/50 transition-all duration-200 focus:border-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary/10 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 max-h-24"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#84523c] to-[#C68A71] text-white transition-all duration-200 hover:shadow-md hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-center text-[10px] text-on-surface-variant/40 mt-2 font-medium">
              Powered by WorthApply AI
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
