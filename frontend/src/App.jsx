import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import WaiterPOS from './pages/WaiterPOS';
import KitchenKDS from './pages/KitchenKDS';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);

  // Setup Axios Interceptor for JWT
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="h-screen w-full bg-[#0a0a0f] overflow-hidden">
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login setUser={setUser} />} />

          {/* Protected Routes mapped to Roles */}
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to={user.role === 'Admin' ? '/admin' : user.role === 'Chef' ? '/kitchen' : '/pos'} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          <Route 
            path="/pos" 
            element={user && (user.role === 'Waiter' || user.role === 'Admin') ? <WaiterPOS /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/kitchen" 
            element={user && (user.role === 'Chef' || user.role === 'Admin') ? <KitchenKDS /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/admin" 
            element={user && user.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
