import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, LogOut, Lock, Bell, Moon, 
  Languages, BarChart2, Shield, HelpCircle, FileText, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { SettingsModals } from './StudentSettingsModals';

const StudentProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'profile', 'password', etc.
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    // ESC key to close
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login', { replace: true });
      toast.success('Logged out successfully');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const userName = user?.full_name || user?.email?.split('@')[0] || 'User';
  const userRole = user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'admin' ? 'Administrator' : user?.role || 'Student';

  const menuItems = [
    { icon: <User size={16} />, label: 'My Profile', action: () => setActiveModal('profile') },
    { icon: <Lock size={16} />, label: 'Change Password', action: () => setActiveModal('password') },
    { icon: <Bell size={16} />, label: 'Notification Settings', action: () => setActiveModal('notifications') },
    { icon: <Moon size={16} />, label: 'Appearance', action: () => setActiveModal('appearance') },
    { icon: <Languages size={16} />, label: 'Language', action: () => setActiveModal('language') },
    { icon: <BarChart2 size={16} />, label: 'Learning Statistics', action: () => setActiveModal('stats') },
    { icon: <Shield size={16} />, label: 'Privacy & Security', action: () => setActiveModal('security') },
    { icon: <HelpCircle size={16} />, label: 'Help & Support', action: () => setActiveModal('help') },
    { icon: <FileText size={16} />, label: 'Terms & Privacy', action: () => setActiveModal('terms') },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-4 border-l border-slate-200 focus:outline-none transition-all group"
        aria-expanded={isOpen}
      >
        <div className="text-right hidden sm:block group-hover:opacity-80 transition-opacity">
          <p className="text-sm font-bold text-slate-900">{userName}</p>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{userRole}</p>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-2 transition-all overflow-hidden ${isOpen ? 'border-cyan-500 shadow-md bg-cyan-600' : 'border-slate-200 bg-slate-400 group-hover:border-slate-300 group-hover:bg-slate-500'}`}>
          {user?.profile_image ? (
            <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            getInitials(userName)
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden"
          >
            {/* Header section */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
                {user?.profile_image ? (
                  <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  getInitials(userName)
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{userRole}</p>
                <p className="text-[10px] text-slate-400 truncate" title={user?.email}>{user?.email}</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-cyan-600 transition-colors text-left"
                >
                  <span className="text-slate-400 group-hover:text-cyan-500">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              
              <div className="h-px bg-slate-100 my-2 mx-4"></div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Modals based on activeModal state */}
      <AnimatePresence>
        {activeModal && (
          <SettingsModals activeModal={activeModal} setActiveModal={setActiveModal} user={user} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentProfileDropdown;
