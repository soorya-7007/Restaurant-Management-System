import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, IndianRupee, Package, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AIPredictor from '../components/AIPredictor';

const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 8900 },
  { name: 'Sat', revenue: 11000 },
  { name: 'Sun', revenue: 9500 },
];

const itemData = [
  { name: 'Burger', sales: 145 },
  { name: 'Pizza', sales: 120 },
  { name: 'Latte', sales: 85 },
  { name: 'Fries', sales: 200 },
];

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-[#0a0a0f] text-white p-8 overflow-y-auto font-sans relative">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Analytics Overview
          </h1>
          <p className="text-slate-400 font-medium">Welcome back, Admin.</p>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-white/10 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between backdrop-blur-md">
          <div>
            <p className="text-slate-400 text-sm mb-1 font-medium">Total Revenue</p>
            <h3 className="text-3xl font-bold">₹44,180</h3>
          </div>
          <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl"><IndianRupee size={28} /></div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between backdrop-blur-md">
          <div>
            <p className="text-slate-400 text-sm mb-1 font-medium">Orders Today</p>
            <h3 className="text-3xl font-bold">142</h3>
          </div>
          <div className="p-4 bg-purple-500/20 text-purple-400 rounded-2xl"><TrendingUp size={28} /></div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between backdrop-blur-md">
          <div>
            <p className="text-slate-400 text-sm mb-1 font-medium">Active Customers</p>
            <h3 className="text-3xl font-bold">89</h3>
          </div>
          <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl"><Users size={28} /></div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between backdrop-blur-md">
          <div>
            <p className="text-slate-400 text-sm mb-1 font-medium">Low Stock Alerts</p>
            <h3 className="text-3xl font-bold text-red-400">2 Items</h3>
          </div>
          <div className="p-4 bg-red-500/20 text-red-400 rounded-2xl"><Package size={28} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Revenue Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md flex flex-col">
          <h2 className="text-xl font-bold mb-6">Weekly Revenue Trend</h2>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e2e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} 
                  itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Predictor (Spans 1 column) */}
        <div className="lg:col-span-1 flex flex-col h-full">
          <AIPredictor />
        </div>

        {/* Item Sales Chart (Spans 3 columns below) */}
        <div className="lg:col-span-3 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6">Top Selling Items</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={itemData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e2e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
