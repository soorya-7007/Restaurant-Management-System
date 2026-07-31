import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle, X, Download, Loader2, IndianRupee } from 'lucide-react';

function CheckoutModal({ isOpen, onClose, total, onPaymentSuccess }) {
  const [step, setStep] = useState('input'); // 'input', 'processing', 'success'

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  const handleFinish = () => {
    onPaymentSuccess();
    setStep('input');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans"
        onClick={step !== 'processing' ? onClose : undefined}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#12121a] border border-white/10 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="text-purple-400" /> Payment Checkout
            </h2>
            {step !== 'processing' && (
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="p-8">
            {step === 'input' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="text-center mb-8">
                  <p className="text-slate-400 mb-2">Total Amount Due</p>
                  <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                    ₹{total.toFixed(2)}
                  </h1>
                </div>

                <div className="space-y-4 mb-8 relative">
                  <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-full pointer-events-none" />
                  <div>
                    <label className="text-sm font-medium text-slate-400 mb-1 block">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        placeholder="4242 4242 4242 4242" 
                        defaultValue="4242 4242 4242 4242"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors tracking-widest font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-slate-400 mb-1 block">Expiry</label>
                      <input type="text" placeholder="MM/YY" defaultValue="12/26" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-mono" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-slate-400 mb-1 block">CVC</label>
                      <input type="text" placeholder="123" defaultValue="123" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-mono" />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handlePay}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <IndianRupee size={20} /> Pay ₹{total.toFixed(2)}
                </button>
                <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
                  Powered by Stripe Test Environment
                </p>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12">
                <Loader2 size={48} className="text-purple-500 animate-spin mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Processing Payment...</h3>
                <p className="text-slate-400">Connecting to secure gateway</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                <p className="text-slate-400 mb-8">Transaction ID: #TRX-{Math.floor(Math.random() * 1000000)}</p>
                
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => alert('Generating PDF Receipt... (Simulated)')}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={18} /> Receipt
                  </button>
                  <button 
                    onClick={handleFinish}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CheckoutModal;
