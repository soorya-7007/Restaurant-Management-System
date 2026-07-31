import React, { useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AIPredictor() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    // Simulate AI network delay (Mocked for portfolio to avoid API key costs)
    setTimeout(() => {
      setAnalysis([
        { type: 'warning', text: 'Burger Buns will deplete by 8:00 PM based on current order velocity.' },
        { type: 'success', text: 'Fries inventory is optimal for the weekend rush.' },
        { type: 'info', text: 'Consider running a promotion on Pizza to boost slow Tuesday sales.' }
      ]);
      setLoading(false);
    }, 2500);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-purple-500/30 p-6 rounded-2xl relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 p-3 opacity-20"><Sparkles size={120} /></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="text-purple-400" size={20} />
            AI Stock Predictor
          </h2>
          <p className="text-slate-400 text-sm mt-1">Powered by Gemini LLM (Mock)</p>
        </div>
        <button 
          onClick={runAnalysis}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      <div className="flex-1 bg-black/30 rounded-xl p-5 border border-white/5 relative z-10">
        {!analysis && !loading && (
          <div className="h-full flex items-center justify-center text-slate-400 italic text-sm text-center px-4">
            Click 'Run Analysis' to generate AI insights on your current inventory depletion rates.
          </div>
        )}

        {loading && (
          <div className="h-full flex flex-col items-center justify-center text-purple-400 space-y-4">
            <Loader2 size={32} className="animate-spin" />
            <span className="text-sm font-medium animate-pulse text-purple-300">Running advanced ML heuristics...</span>
          </div>
        )}

        <AnimatePresence>
          {analysis && !loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              {analysis.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  key={idx} 
                  className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                >
                  {item.type === 'warning' && <AlertTriangle size={20} className="text-orange-400 mt-0.5 shrink-0" />}
                  {item.type === 'success' && <CheckCircle size={20} className="text-emerald-400 mt-0.5 shrink-0" />}
                  {item.type === 'info' && <Sparkles size={20} className="text-blue-400 mt-0.5 shrink-0" />}
                  <p className="text-sm font-medium text-slate-200 leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AIPredictor;
