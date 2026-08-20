import React, { useState, useEffect } from 'react';
import ChatPanel from './ui/ChatPanel';
import StrategyBuilder from './ui/StrategyBuilder';

const UIOverlay: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system/status`);
        const data = await response.json();
        if (data.active !== undefined) {
          setIsSystemActive(data.active);
        }
      } catch (e) {
        console.error('Error fetching system status:', e);
      }
    };
    checkStatus();
  }, []);

  const toggleSystem = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !isSystemActive }),
      });
      const data = await response.json();
      if (data.active !== undefined) {
        setIsSystemActive(data.active);
      }
    } catch (e) {
      console.error('Error toggling system state:', e);
      alert('Failed to change system state. Please check backend connection.');
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Top Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
            chatOpen
              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
              : 'bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {chatOpen ? 'Close Chat' : 'Agent Chat'}
        </button>

        <button
          onClick={() => setBuilderOpen(!builderOpen)}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
            builderOpen
              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
              : 'bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {builderOpen ? 'Close Builder' : 'Strategy Builder'}
        </button>

        <button
          onClick={toggleSystem}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${
            isSystemActive
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/40'
              : 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isSystemActive ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
          {isSystemActive ? 'Company Active' : 'Company Paused'}
        </button>
      </div>

      {/* Panels */}
      <div className="pointer-events-auto">
        <ChatPanel
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
        <StrategyBuilder
          isOpen={builderOpen}
          onClose={() => setBuilderOpen(false)}
        />
      </div>
    </div>
  );
};

export default UIOverlay;
