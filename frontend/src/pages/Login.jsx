import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, ShieldCheck, Mail, Lock, Loader2, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set user globally
      setUser(user);
      
      // Redirect based on RBAC
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Chef') navigate('/kitchen');
      else navigate('/pos');

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const setTestCreds = (e, p) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0f] text-white items-center justify-center relative overflow-hidden font-sans">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2rem] shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mx-auto mb-6">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2 tracking-tight">System Access</h1>
          <p className="text-slate-400">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5 mb-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="border-t border-white/10 pt-6">
          <p className="text-xs text-slate-500 mb-3 text-center uppercase tracking-wider font-semibold">Test Credentials</p>
          <div className="flex justify-center gap-2">
            <button type="button" onClick={() => setTestCreds('admin@demo.com', 'password123')} className="px-3 py-1.5 bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 rounded text-xs transition-colors border border-white/5">Admin</button>
            <button type="button" onClick={() => setTestCreds('chef@demo.com', 'password123')} className="px-3 py-1.5 bg-white/5 hover:bg-orange-500/20 text-slate-400 hover:text-orange-300 rounded text-xs transition-colors border border-white/5">Chef</button>
            <button type="button" onClick={() => setTestCreds('waiter@demo.com', 'password123')} className="px-3 py-1.5 bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-300 rounded text-xs transition-colors border border-white/5">Waiter</button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p className="flex items-center justify-center gap-1">
            <KeyRound size={12} /> Secured by RSA-256 JWT
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
