import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, Coffee, Home, Plus, Minus, ChevronRight, X, LogOut, Monitor, Printer, Moon, Sun, CreditCard } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutModal from '../components/CheckoutModal';

function WaiterPOS() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/menu');
        setMenuItems(data);
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    };
    fetchMenu();
  }, []);

  const categories = ['All', 'Mains', 'Sides', 'Desserts', 'Drinks'];

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    
    try {
      await axios.post('http://localhost:5000/api/orders', {
        branch_id: 1,
        table_number: 'Table 4',
        items: cart,
        total_amount: total * 1.08
      });
      // Do not alert here, the modal handles the success UI
      setCart([]);
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order');
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const mockNotifications = [
    { id: 1, message: "Order #12 is ready for pickup!", time: "2m ago", type: "success" },
    { id: 2, message: "Table 5 requested the bill.", time: "5m ago", type: "info" },
    { id: 3, message: "Low stock: Beef Patties", time: "1h ago", type: "warning" }
  ];

  const bgColor = isDarkMode ? 'bg-[#0a0a0f]' : 'bg-slate-100';
  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const panelBg = isDarkMode ? 'bg-[#12121a]' : 'bg-white';
  const cardBg = isDarkMode ? 'bg-white/5' : 'bg-white';
  const cardBorder = isDarkMode ? 'border-white/10' : 'border-slate-200';

  return (
    <div className={`flex h-full ${bgColor} ${textColor} overflow-hidden relative font-sans transition-colors duration-500`}>
      
      {/* Background Ambient Glow */}
      {isDarkMode && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Sidebar Navigation */}
      <div className={`w-24 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'} border-r flex flex-col items-center py-8 z-30 backdrop-blur-xl relative`}>
        <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-12 cursor-pointer transition-transform hover:scale-105">
          <Home className="text-white" size={24} />
        </div>
        
        <div className={`flex flex-col gap-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <button className={`p-3 rounded-xl shadow-lg transition-all hover:scale-105 ${isDarkMode ? 'bg-white/10 text-white shadow-black/20' : 'bg-purple-100 text-purple-600 shadow-purple-500/10'}`}>
            <Coffee size={24} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsSettingsOpen(false); }}
              className={`p-3 rounded-xl transition-all relative ${isNotifOpen ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900') : (isDarkMode ? 'hover:text-white hover:bg-white/5' : 'hover:bg-slate-100')}`}
            >
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-transparent" />
            </button>
          </div>

          <button 
            onClick={() => { setIsSettingsOpen(true); setIsNotifOpen(false); }}
            className={`p-3 rounded-xl transition-all ${isDarkMode ? 'hover:text-white hover:bg-white/5' : 'hover:bg-slate-100'}`}
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Overlay Backdrop for Notifications */}
      <AnimatePresence>
        {isNotifOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsNotifOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20"
          />
        )}
      </AnimatePresence>

      {/* Slide-out Notifications Panel */}
      <AnimatePresence>
        {isNotifOpen && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={`absolute left-24 top-0 bottom-0 w-80 ${panelBg} shadow-2xl border-r ${cardBorder} z-20 p-6 flex flex-col`}
          >
            <div className="flex justify-between items-center mb-6 pt-12">
              <h2 className="text-xl font-bold">Notifications</h2>
              <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
            </div>
            
            <div className="flex flex-col gap-4">
              {mockNotifications.map(notif => (
                <div key={notif.id} className={`${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'} border ${cardBorder} rounded-2xl p-4 transition-colors cursor-pointer`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-full ${
                      notif.type === 'success' ? 'bg-emerald-500' : 
                      notif.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-xs text-slate-400 font-medium">{notif.time}</span>
                  </div>
                  <p className="text-sm font-medium">{notif.message}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-8 overflow-hidden z-10 relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400' : 'text-slate-800'}`}>Point of Sale</h1>
            <p className="text-slate-400 font-medium">Take orders seamlessly.</p>
          </div>
          
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search menu..." 
              className={`w-full rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${isDarkMode ? 'bg-white/5 border border-white/10 text-white placeholder-slate-500' : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm'}`}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-4 mb-8">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                  : (isDarkMode ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200')
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto pr-4 pb-12 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredItems.map(item => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  onClick={() => addToCart(item)}
                  key={item.id} 
                  className={`group ${cardBg} border ${cardBorder} rounded-3xl overflow-hidden cursor-pointer hover:border-purple-500/50 transition-all shadow-xl backdrop-blur-sm`}
                >
                  <div className="h-48 bg-slate-800 relative overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-white border border-white/10">
                      ₹{item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-5 relative">
                    <button className="absolute -top-6 right-5 w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-600/30 text-white transition-transform group-hover:scale-110">
                      <Plus size={24} />
                    </button>
                    <h3 className={`font-bold text-xl mb-1 pr-10 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.name}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Current Order Cart */}
      <div className={`w-[400px] ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'} border-l p-8 flex flex-col z-10 backdrop-blur-xl shadow-2xl`}>
        <h2 className="text-2xl font-bold mb-1">Current Order</h2>
        <p className="text-slate-400 text-sm mb-8">Table 4 • Dine In</p>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 custom-scrollbar">
          <AnimatePresence>
            {cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex-1 flex flex-col items-center justify-center text-slate-500"
              >
                <div className={`w-24 h-24 mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'} rounded-full flex items-center justify-center`}>
                  <Coffee size={40} className="opacity-50" />
                </div>
                <p>No items in the order yet</p>
              </motion.div>
            ) : (
              cart.map(item => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  key={item.id} 
                  className={`${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} p-4 rounded-2xl flex gap-4 items-center border`}
                >
                  <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 leading-tight">{item.name}</h4>
                    <p className="text-purple-500 font-bold">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className={`flex items-center gap-3 ${isDarkMode ? 'bg-white/10' : 'bg-white border border-slate-200'} rounded-full px-2 py-1`}>
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-purple-500 text-slate-400"><Minus size={14} /></button>
                    <span className="w-4 text-center font-semibold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-purple-500 text-slate-400"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-2">
                    <X size={18} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className={`pt-6 mt-4 border-t ${cardBorder}`}>
          <div className="flex justify-between mb-3 text-slate-400">
            <span>Subtotal</span>
            <span className="font-medium text-current">₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-6 text-slate-400">
            <span>Tax (8%)</span>
            <span className="font-medium text-current">₹{(total * 0.08).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-8 text-2xl font-bold">
            <span>Total</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
              ₹{(total * 1.08).toFixed(2)}
            </span>
          </div>
          
          <button 
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-xl ${
              cart.length === 0 
                ? (isDarkMode ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed')
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/25 hover:scale-[1.02]'
            }`}
          >
            <CreditCard size={20} />
            Proceed to Payment
          </button>
        </div>
      </div>

      {/* Settings Modal Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`${panelBg} border ${cardBorder} w-[500px] rounded-3xl p-8 shadow-2xl`}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Settings</h2>
                <button onClick={() => setIsSettingsOpen(false)} className={`text-slate-400 hover:text-red-500 p-2 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'} rounded-full`}><X size={20} /></button>
              </div>

              <div className="flex flex-col gap-4">
                <button onClick={() => alert('Terminal pairing mode activated.')} className={`flex items-center justify-between p-4 rounded-2xl transition-colors border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-transparent hover:border-white/10' : 'bg-white border-slate-200 hover:border-purple-500 shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-500/20 text-purple-500 rounded-lg"><Monitor size={20} /></div>
                    <div className="text-left">
                      <p className="font-semibold">POS Terminal Setup</p>
                      <p className="text-sm text-slate-400">Configure device & pairing</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-400" />
                </button>

                <button onClick={() => alert('Connecting to Epson TM-T88VI...')} className={`flex items-center justify-between p-4 rounded-2xl transition-colors border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-transparent hover:border-white/10' : 'bg-white border-slate-200 hover:border-blue-500 shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg"><Printer size={20} /></div>
                    <div className="text-left">
                      <p className="font-semibold">Receipt Printer</p>
                      <p className="text-sm text-slate-400">Epson TM-T88VI connected</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-400" />
                </button>

                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`flex items-center justify-between p-4 rounded-2xl transition-colors border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-transparent hover:border-white/10' : 'bg-white border-slate-200 hover:border-orange-500 shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-white'}`}>
                      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Appearance</p>
                      <p className="text-sm text-slate-400">{isDarkMode ? 'Dark mode active' : 'Light mode active'}</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${isDarkMode ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </button>
              </div>

              <button onClick={() => alert('Signed out successfully.')} className="mt-8 w-full py-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2">
                <LogOut size={20} />
                Sign Out
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        total={total * 1.08} 
        onPaymentSuccess={handlePlaceOrder} 
      />

    </div>
  );
}

export default WaiterPOS;
