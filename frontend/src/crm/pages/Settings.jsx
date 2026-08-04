import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Bell, Shield, Palette, Loader2, Mail, Info, ShieldAlert } from 'lucide-react';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [activeTab, setActiveTab] = useState('profile');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full Name is required');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'profile', name: 'Profile Settings', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-medium">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Sidebar tabs */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 space-y-1.5">
          {sections.map((section) => {
            const Icon = section.icon;
            const active = section.id === activeTab;
            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  active 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/10' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                <span>{section.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-8"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Personal Information</h3>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Update your metadata</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      disabled
                      type="email" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-500 font-medium cursor-not-allowed opacity-75" 
                      value={user?.email || 'user@example.com'}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-1.5 flex items-center gap-1">
                    <Info size={12} />
                    Registered email address cannot be changed.
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-sm shadow-md shadow-cyan-500/10 hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {loading && <Loader2 className="animate-spin" size={16} />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab !== 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center py-16"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 mx-auto mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Custom Section</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                Preferences configuration for this node is coming soon.
              </p>
            </motion.div>
          )}

          {/* Danger zone */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2rem] border border-red-100 shadow-sm p-8 space-y-6"
          >
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Danger Zone</h3>
                <p className="text-xs text-red-500 font-semibold uppercase tracking-wider">High risk actions</p>
              </div>
            </div>

            <p className="text-slate-500 text-sm leading-relaxed">
              Once you delete your account, all associated credentials and roles will be purged. This action is permanent and cannot be reversed.
            </p>
            
            <button className="px-6 py-3 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-bold text-sm rounded-xl transition-all active:scale-95">
              Delete Account
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
