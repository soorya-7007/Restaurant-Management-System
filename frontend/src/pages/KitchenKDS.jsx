import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, Flame } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

function KitchenKDS() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    socket.emit('joinKitchen');

    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/orders');
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      }
    };
    fetchOrders();

    socket.on('newOrder', (order) => {
      setOrders(prev => [order, ...prev]);
    });

    return () => {
      socket.off('newOrder');
    };
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'border-blue-500/50 shadow-blue-500/20';
      case 'Preparing': return 'border-orange-500/50 shadow-orange-500/20';
      case 'Ready': return 'border-emerald-500/50 shadow-emerald-500/20';
      default: return 'border-white/10';
    }
  };

  return (
    <div className="h-full bg-slate-950 p-8 text-slate-100 overflow-y-auto">
      <h1 className="text-3xl font-semibold mb-8 flex items-center gap-3">
        <Flame className="text-orange-500" /> Kitchen Display System
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[calc(100vh-160px)]">
        {['New', 'Preparing', 'Ready'].map(columnStatus => (
          <div key={columnStatus} className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col">
            <h2 className="text-xl font-medium mb-6 flex items-center justify-between">
              {columnStatus}
              <span className="text-sm bg-white/10 px-3 py-1 rounded-full">
                {orders.filter(o => (o.status || 'New') === columnStatus).length}
              </span>
            </h2>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              <AnimatePresence>
                {orders.filter(o => (o.status || 'New') === columnStatus).map(order => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={order.id} 
                    className={`bg-slate-900 border-2 rounded-2xl p-5 shadow-lg ${getStatusColor(columnStatus)}`}
                  >
                    <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                      <div>
                        <h3 className="font-bold text-lg">Order #{order.id}</h3>
                        <p className="text-slate-400 text-sm mt-1">{order.table_number}</p>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <Clock size={14} />
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <ul className="mb-6 flex flex-col gap-2">
                      {order.OrderItems?.map(item => (
                        <li key={item.id} className="flex justify-between text-sm text-slate-300">
                          <span>{item.quantity}x Item #{item.menu_item_id}</span>
                        </li>
                      ))}
                      {!order.OrderItems && (
                        <li className="text-sm text-slate-500 italic">No item details available</li>
                      )}
                    </ul>

                    <div className="flex gap-2">
                      {columnStatus === 'New' && (
                        <button onClick={() => updateStatus(order.id, 'Preparing')} className="flex-1 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 py-2 rounded-xl text-sm font-medium transition-colors">
                          Start Preparing
                        </button>
                      )}
                      {columnStatus === 'Preparing' && (
                        <button onClick={() => updateStatus(order.id, 'Ready')} className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                          <CheckCircle size={16} /> Mark Ready
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KitchenKDS;
