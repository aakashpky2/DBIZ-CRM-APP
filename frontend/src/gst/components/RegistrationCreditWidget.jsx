import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const RegistrationCreditWidget = () => {
  const [wallet, setWallet] = useState(null);

  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      // We are connecting to the CRM backend to get the real-time student credits.
      const apiUrl = import.meta.env.VITE_CRM_API_URL || '/api';
      const API_URL = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl.replace(/\/$/, '')}/api`;
      const res = await axios.get(`${API_URL}/student/credits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setWallet(res.data.credits);
      }
    } catch (err) {
      console.error('Failed to fetch credits for widget', err);
    }
  };

  useEffect(() => {
    fetchCredits();
    const interval = setInterval(fetchCredits, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  if (!wallet) return null;

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed right-6 top-24 z-50 bg-white border border-slate-200 shadow-xl rounded-2xl w-64 overflow-hidden"
    >
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
        <h4 className="font-bold text-slate-800 text-sm">Credit Summary</h4>
        <span className="bg-cyan-100 text-cyan-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Live</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Used</span>
          <span className="text-xl font-black text-rose-500">{wallet.used_credits}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Remaining</span>
          <span className="text-xl font-black text-emerald-500">{wallet.remaining_credits}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            style={{ width: `${Math.max(0, (wallet.remaining_credits / wallet.total_credits) * 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2">Credits update automatically on successful saves.</p>
      </div>
    </motion.div>
  );
};

export default RegistrationCreditWidget;
