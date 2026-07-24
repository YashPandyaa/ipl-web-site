'use client';

import React, { useState, useEffect, useRef } from 'react';
import { postAICommentary } from '../lib/api';
import { MessageSquare, Send, Bot, User, Clock, AlertTriangle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function AIChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hello! I am your AI IPL Analyst. Ask me anything about IPL history, player records, or tactical comparisons! (Example: 'Who has the best batting record in IPL?' or 'Compare Virat Kohli and MS Dhoni')",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [debounceSeconds, setDebounceSeconds] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debounce cooldown timer effect
  useEffect(() => {
    if (debounceSeconds <= 0) return;
    const timer = setInterval(() => {
      setDebounceSeconds(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [debounceSeconds]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || debounceSeconds > 0) return;

    const userText = input.trim();
    setInput('');
    
    // Add user message
    const userMsgId = String(Date.now());
    setMessages(prev => [...prev, {
      id: userMsgId,
      sender: 'user',
      text: userText,
      timestamp: new Date()
    }]);

    setLoading(true);
    // Trigger 5-second debounce countdown
    setDebounceSeconds(5);

    try {
      const res = await postAICommentary(userText);
      const botReply = res?.answer || "My analysis channels are currently clogged. Please check your network or try again.";
      
      setMessages(prev => [...prev, {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: botReply,
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: "Sorry, I ran into an error generating that commentary. Please try again in a bit.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark backdrop-blur-none dark:backdrop-blur-md h-[550px] shadow-xl overflow-hidden w-full max-w-2xl mx-auto my-6">
      {/* Bot Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-base-light/80 dark:bg-base-dark/80 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-xl text-gold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark text-sm">AI Sports Analyst</h3>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">Powered by Claude Sonnet</span>
            </div>
          </div>
        </div>
        {debounceSeconds > 0 && (
          <div className="flex items-center gap-1 text-[10px] bg-accent-orange/10 text-accent-orange px-2.5 py-1 rounded-md font-mono border border-accent-orange/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Cooldown: {debounceSeconds}s</span>
          </div>
        )}
      </div>

      {/* Messages Log */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${
                isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'
              }`}
            >
              {/* Avatar Icon */}
              <div className={`p-2 rounded-xl shrink-0 ${
                isBot ? 'bg-base-light dark:bg-base-dark text-gold border border-border-light dark:border-border-dark' : 'bg-gold text-brand-dark'
              }`}>
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Text Bubble */}
              <div className={`flex flex-col gap-1 ${isBot ? 'items-start' : 'items-end'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  isBot 
                    ? 'bg-base-light/80 dark:bg-base-dark/80 text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark rounded-tl-none' 
                    : 'bg-gradient-to-r from-gold to-gold-light text-brand-dark font-medium rounded-tr-none shadow-md'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-text-secondary-light dark:text-text-secondary-dark px-1 font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-start gap-3 max-w-[85%] mr-auto">
            <div className="p-2 rounded-xl bg-base-light dark:bg-base-dark text-gold border border-border-light dark:border-border-dark shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-base-light/50 dark:bg-base-dark/50 text-text-secondary-light dark:text-text-secondary-dark border border-border-light/50 dark:border-border-dark/50 px-4 py-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
              <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span>Analyst is studying data sheets...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-4 bg-base-light/80 dark:bg-base-dark/80 border-t border-border-light dark:border-border-dark flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || debounceSeconds > 0}
          placeholder={
            debounceSeconds > 0 
              ? `Waiting for API cooldown (${debounceSeconds}s)...` 
              : "Ask the analyst a question..."
          }
          className="flex-1 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-xl px-4 py-2.5 text-sm text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || debounceSeconds > 0}
          className="p-2.5 bg-gold text-brand-dark hover:bg-gold-light rounded-xl disabled:opacity-30 disabled:hover:bg-gold transition-colors shadow-md shrink-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
