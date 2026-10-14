'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Send, Square, ArrowDown, Bot, User, Sparkles } from 'lucide-react';

export default function ChatCoach() {
  const { messages, sendMessage, status, stop } = useChat();
  const [input, setInput] = useState('');

  const isLoading = status === 'streaming' || status === 'submitted';

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUserScrolledUp(false);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60;
    setUserScrolledUp(!isAtBottom);
  };

  useEffect(() => {
    if (!userScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, userScrolledUp]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput('');
    await sendMessage({ text: userText });
  };

  return (
    <div className="flex flex-col h-[650px] w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              Memory Coach <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400">Real-time cognitive & recall strategist</p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 relative scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Bot className="w-12 h-12 mb-3 text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-300">Welcome to MemoryMatch AI Coach!</p>
            <p className="text-xs max-w-xs mt-1 text-slate-500">
              Ask about mnemonic recall strategies, tile memory techniques, or focus exercises.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const textContent =
              m.parts
                ?.filter((p) => p.type === 'text')
                .map((p) => (p as { text: string }).text)
                .join('') || '';

            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role !== 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mt-0.5 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-tl-sm whitespace-pre-wrap'
                  }`}
                >
                  {textContent}
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 mt-0.5 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Thinking Indicator */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-slate-800/90 border border-slate-700/60 text-slate-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Thinking & formulating strategy...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

        {userScrolledUp && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur border border-slate-700 text-xs text-slate-300 px-3 py-1.5 rounded-full shadow-lg hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <ArrowDown className="w-3.5 h-3.5" /> Jump to latest
          </button>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={onSubmit}
        className="p-3 md:p-4 border-t border-slate-800 bg-slate-950/50 backdrop-blur flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for memory tactics, card recall tips..."
          className="flex-1 bg-slate-900 border border-slate-700/70 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition"
        />

        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="px-3.5 py-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-xl hover:bg-rose-500/30 transition flex items-center gap-1.5 text-xs font-medium shrink-0"
            title="Stop generation"
          >
            <Square className="w-3.5 h-3.5 fill-rose-400" />
            <span className="hidden sm:inline">Stop</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition flex items-center gap-1.5 text-xs font-medium shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        )}
      </form>
    </div>
  );
}
