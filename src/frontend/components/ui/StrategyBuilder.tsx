import React, { useState } from 'react';

interface Condition {
  id: string;
  metric: string;
  operator: '>' | '<' | '==' | '|';
  value: string;
}

interface StrategyBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

const StrategyBuilder: React.FC<StrategyBuilderProps> = ({ isOpen, onClose }) => {
  const [strategyName, setStrategyName] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', metric: 'Price', operator: '<', value: '100' },
  ]);
  const [action, setAction] = useState('BUY');

  const addCondition = () => {
    const newCond: Condition = {
      id: Date.now().toString(),
      metric: 'Price',
      operator: '<',
      value: '',
    };
    setConditions([...conditions, newCond]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const updateCondition = (id: string, field: keyof Condition, value: string) => {
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = () => {
    console.log('Saving Strategy:', { strategyName, conditions, action });
    alert('Strategy saved successfully!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute left-4 top-20 w-96 h-[500px] bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200 z-50 animate-in fade-in slide-in-from-left-8 duration-500 ease-out">
      <div className="p-4 bg-slate-800/40 border-b border-slate-700/50 flex justify-between items-center">
        <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Strategy Builder</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-all p-1 hover:bg-slate-700/50 rounded-full group"
        >
          <span className="group-hover:rotate-90 transition-transform duration-200">✕</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Strategy Name</label>
          <input
            type="text"
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            placeholder="e.g. Mean Reversion Alpha"
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Conditions</label>
            <button
              onClick={addCondition}
              className="text-xs bg-slate-800/50 hover:bg-slate-700 border border-slate-600/50 px-2 py-1 rounded-lg transition-colors text-blue-400 font-medium"
            >
              + Add Condition
            </button>
          </div>

          <div className="space-y-2">
            {conditions.map((cond) => (
              <div key={cond.id} className="flex gap-2 items-center bg-slate-800/40 p-2 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <select
                  value={cond.metric}
                  onChange={(e) => updateCondition(cond.id, 'metric', e.target.value)}
                  className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                >
                  <option value="Price">Price</option>
                  <option value="Volume">Volume</option>
                  <option value="RSI">RSI</option>
                  <option value="MACD">MACD</option>
                </select>

                <select
                  value={cond.operator}
                  onChange={(e) => updateCondition(cond.id, 'operator', e.target.value)}
                  className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                >
                  <option value=">">{'>'}</option>
                  <option value="<">{'<'}</option>
                  <option value="==">{'=='}</option>
                </select>

                <input
                  type="text"
                  value={cond.value}
                  onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-600"
                />

                <button
                  onClick={() => removeCondition(cond.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Execution Action</label>
          <div className="flex gap-2">
            {['BUY', 'SELL', 'HOLD'].map((opt) => (
              <button
                key={opt}
                onClick={() => setAction(opt)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  action === opt
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 scale-[1.02]'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-800/40 border-t border-slate-700/50">
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/40"
        >
          Deploy Strategy
        </button>
      </div>
    </div>
  );
};

export default StrategyBuilder;
