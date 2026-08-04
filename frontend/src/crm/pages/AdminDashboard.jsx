import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Settings as SettingsIcon, 
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Activity,
  Plus,
  Shield,
  FileText,
  UserCheck,
  TrendingUp,
  Video
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import UserManagement from './UserManagement';
import SystemRole from './SystemRole';
import ManageVideos from '../components/ManageVideos';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Logout handler
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Mock statistics for the Admin Dashboard
  const stats = [
    { label: 'Total Assigned Users', value: '4', change: '+25%', color: 'from-blue-600 to-cyan-500', icon: <Users className="text-white" size={24} /> },
    { label: 'Active Roles', value: '1', change: 'Stable', color: 'from-indigo-600 to-purple-500', icon: <Shield className="text-white" size={24} /> },
    { label: 'Recent System Activities', value: '48', change: '+12%', color: 'from-emerald-600 to-teal-500', icon: <Activity className="text-white" size={24} /> },
  ];

  // Menu items list for Admin Console
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'User Management', icon: <Users size={20} /> },
    { name: 'System Roles', icon: <ShieldAlert size={20} /> },
    { name: 'Videos', icon: <Video size={20} /> },
    { name: 'Learning Portal', icon: <FileText size={20} /> },
    { name: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex overflow-hidden font-sans">
      
      {/* Sidebar Panel */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 z-20">
        <div>
          {/* Sidebar Header / Logo */}
          <div className="h-20 flex items-center gap-3 px-8 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-wide text-lg block">DBIZ CRM</span>
              <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest block -mt-1">Admin Panel</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200 group relative
                    ${isActive 
                      ? 'text-cyan-600 bg-cyan-50 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <span className={`transition-colors duration-200 ${isActive ? 'text-cyan-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="activeAdminSideIndicator"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-cyan-600 rounded-l-full" 
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Logout */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold text-rose-500 hover:text-white hover:bg-rose-500 transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-[#F8FAFC]">
        {/* Top Navbar */}
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span>Administration</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">{activeTab}</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Input */}
            <div className="relative w-64 hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-transparent outline-none focus:bg-white focus:border-cyan-500/50 transition-colors"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative w-10 h-10 rounded-xl bg-slate-50 border border-transparent flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500" />
            </button>

            {/* Profile Info */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-cyan-500/10">
                AD
              </div>
              <div className="hidden md:block">
                <span className="block text-xs font-bold text-slate-900 leading-none">
                  {user?.username?.split('@')[0] || 'Admin'}
                </span>
                <span className="text-[9px] font-bold text-emerald-500 tracking-wider uppercase block mt-1">Administrator</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden md:block" />
            </div>
          </div>
        </header>

        {/* Dashboard Views */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              
              {/* RENDER VIEW: DASHBOARD */}
              {activeTab === 'Dashboard' && (
                <>
                  {/* Welcome Message Card */}
                  <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 md:p-10 shadow-sm">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-cyan-500/5 to-transparent blur-3xl pointer-events-none" />
                    <div className="relative z-10 space-y-4 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 rounded-full border border-cyan-100">
                        <Activity size={14} className="text-cyan-600 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">Admin Console</span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Welcome, Administrator
                      </h1>
                      <p className="text-slate-500 text-base md:text-lg leading-relaxed">
                        Access student roles, customize granular permissions, and perform robust user directory management inside the admin panel.
                      </p>
                      <div className="pt-2 flex flex-wrap gap-3">
                        <button 
                          onClick={() => setActiveTab('User Management')}
                          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-cyan-600/10"
                        >
                          <Plus size={16} />
                          Create New Student
                        </button>
                        <button 
                          onClick={() => setActiveTab('System Roles')}
                          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                        >
                          <Shield size={16} className="text-slate-500" />
                          Configure Roles
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, idx) => (
                      <div 
                        key={idx}
                        className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
                      >
                        <div className="flex justify-between items-center mb-6">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                            {stat.icon}
                          </div>
                          <span className="text-[11px] font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp size={12} />
                            {stat.change}
                          </span>
                        </div>
                        <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
                        <p className="text-sm font-semibold text-slate-500 mt-2">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Action Shortcuts */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-950 mb-6">Console Quick Shortcuts</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={() => setActiveTab('User Management')}
                        className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 text-left transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shrink-0">
                          <Users size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">Manage User Profiles</h3>
                          <p className="text-xs text-slate-500 mt-1">Add, edit, deactivate, or assign students within the enterprise registry.</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => setActiveTab('System Roles')}
                        className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 text-left transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0">
                          <ShieldAlert size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">Configure Access Roles</h3>
                          <p className="text-xs text-slate-500 mt-1">Review active system priorities, permissions schemes, and role allocations.</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* RENDER VIEW: SYSTEM ROLES */}
              {activeTab === 'System Roles' && (
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                  <SystemRole />
                </div>
              )}

              {/* RENDER VIEW: USER MANAGEMENT */}
              {activeTab === 'User Management' && (
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                  <UserManagement />
                </div>
              )}

              {/* RENDER VIEW: SETTINGS */}
              {activeTab === 'Settings' && (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                  <div className="text-center py-16 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center mx-auto text-cyan-600 border border-cyan-100">
                      <Shield size={32} />
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">Admin Control Center</h3>
                      <p className="text-slate-500 text-sm">
                        This section lists and allows modifications of system-wide settings. Advanced parameters are actively enforced for the Admin console.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER VIEW: VIDEOS */}
              {activeTab === 'Videos' && (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                  <div className="flex flex-col items-center py-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">CRM Overview Videos</h3>
                    <div className="overflow-hidden rounded-3xl shadow-xl border border-slate-200">
                      <iframe 
                        width="315" 
                        height="560" 
                        src="https://www.youtube.com/embed/IwJNM2yS7wk" 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER VIEW: LEARNING PORTAL */}
              {activeTab === 'Learning Portal' && (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                  <ManageVideos />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
