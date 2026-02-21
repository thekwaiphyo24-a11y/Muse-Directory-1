import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2, User, Bot } from 'lucide-react';
import { GeminiService, ChatMessage } from '../services/gemini';
import { cn } from '../lib/utils';

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await GeminiService.chat(messages, input);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error('Chat failed:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 bg-brand-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40",
          isOpen && "hidden"
        )}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col border border-brand-primary/10 transition-all duration-300 z-50 origin-bottom-right",
          !isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="p-4 border-bottom border-brand-primary/5 flex items-center justify-between bg-brand-primary text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Marketing Assistant</h3>
              <p className="text-[10px] opacity-70">Powered by Gemini 3.1 Pro</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg/10">
          {messages.length === 0 && (
            <div className="text-center py-10 px-6">
              <p className="text-sm text-brand-primary/40 italic">
                "How can I help you with your marketing strategy today?"
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                msg.role === 'user' ? "bg-brand-primary" : "bg-brand-accent"
              )}>
                {msg.role === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-white" />}
              </div>
              <div className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-brand-primary text-white rounded-tr-none" 
                  : "bg-white border border-brand-primary/10 rounded-tl-none shadow-sm"
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 mr-auto">
              <div className="w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="bg-white border border-brand-primary/10 p-3 rounded-2xl rounded-tl-none shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-brand-accent" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-brand-primary/5 bg-white rounded-b-3xl">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full pl-4 pr-12 py-3 bg-brand-bg/30 border border-brand-primary/10 rounded-xl text-sm focus:ring-1 focus:ring-brand-accent outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-accent hover:text-brand-accent/80 disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
