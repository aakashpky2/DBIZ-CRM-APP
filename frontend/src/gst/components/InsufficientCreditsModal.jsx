import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InsufficientCreditsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100"
        >
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 mb-2 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900">Insufficient Credits</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              You do not have enough credits to continue the GST Registration process. Please request more credits from your administrator.
            </p>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
            <button 
              onClick={() => {
                window.location.href = 'http://localhost:5173/'; // Return to CRM dashboard
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98]"
            >
              Request Credits
            </button>
            <button 
              onClick={() => {
                window.location.href = 'http://localhost:5173/'; // Return to CRM dashboard
              }}
              className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              Return to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InsufficientCreditsModal;
