import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Wallet, TrendingDown, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreditWalletCard = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${API_URL}/student/credits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setWallet(res.data.credits);
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
    // Poll every 30 seconds for real-time dashboard feel
    const interval = setInterval(fetchCredits, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !wallet) return <div className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>;

  const percentage = Math.max(0, (wallet.remaining_credits / wallet.total_credits) * 100);
  
  let statusColor = 'bg-emerald-500';
  let statusText = 'Active';
  if (wallet.remaining_credits <= 0) {
    statusColor = 'bg-rose-500';
    statusText = 'Exhausted';
  } else if (wallet.remaining_credits <= 10) {
    statusColor = 'bg-amber-500';
    statusText = 'Low';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Wallet size={20} />
          </div>
          <h3 className="font-semibold text-slate-800">Credit Wallet</h3>
        </div>
        <div className={`px-3 py-1 text-xs font-medium rounded-full text-white ${statusColor}`}>
          {statusText}
        </div>
      </div>
      
      <div className="p-5 grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-slate-800">{wallet.total_credits}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-700">
          <p className="text-xs text-rose-500 font-medium mb-1 uppercase tracking-wider">Used</p>
          <div className="flex items-center justify-center gap-1">
            <TrendingDown size={16} />
            <p className="text-2xl font-bold">{wallet.used_credits}</p>
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
          <p className="text-xs text-indigo-500 font-medium mb-1 uppercase tracking-wider">Remaining</p>
          <p className="text-2xl font-bold">{wallet.remaining_credits}</p>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Capacity Usage</span>
          <span>{percentage.toFixed(0)}% Remaining</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-2 rounded-full ${statusColor}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CreditWalletCard;
