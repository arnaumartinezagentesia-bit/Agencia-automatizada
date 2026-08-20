import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: 'Hello! I am your Strategic Agent. How can I help you optimize your enterprise today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    const currentInput = inputValue;
    setInputValue('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: 'default-session',
          message: currentInput,
        }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();

      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: data.final_verdict || 'Processed successfully.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentResponse]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: 'Sorry, I encountered an error connecting to the brain. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-20 w-80 h-[500px] bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200 z-50 animate-in fade-in slide-in-from-right-8 duration-500 ease-out">
      <div className="p-4 bg-slate-800/40 border-b border-slate-700/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Agent Intelligence</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-all p-1 hover:bg-slate-700/50 rounded-full group"
        >
          <span className="group-hover:rotate-90 transition-transform duration-200">✕</span>
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm transition-all ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/20'
                  : 'bg-slate-800/60 text-slate-200 rounded-tl-none border border-slate-700/50 backdrop-blur-sm'
              }`}
            >
              {msg.text}
              <div className="text-[10px] opacity-40 mt-1 text-right font-mono">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-800/40 border-t border-slate-700/50 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Enter command..."
          className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-600"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/30"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPanel;
