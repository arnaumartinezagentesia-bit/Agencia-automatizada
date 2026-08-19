import React, { useState } from 'react';
import ChatPanel from './ui/ChatPanel';
import StrategyBuilder from './ui/StrategyBuilder';

const UIOverlay: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);

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
