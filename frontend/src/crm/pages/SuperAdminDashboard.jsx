import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Radio, 
  Building2, 
  UserCheck, 
  GraduationCap, 
  Users, 
  ShieldAlert, 
  Settings as SettingsIcon, 
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Activity,
  Plus,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  MapPin,
  Mail,
  Shield,
  FileText,
  Coins,
  History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import UserManagement from './UserManagement';
import SystemRole from './SystemRole';

const SuperAdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [creditConfigs, setCreditConfigs] = useState([]);
  const [editingConfig, setEditingConfig] = useState(null);

  // Super Admin Credits System States
  const [creditRequests, setCreditRequests] = useState([]);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [creditsStats, setCreditsStats] = useState({
    totalAssigned: 0,
    totalUsed: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0
  });
  const [loadingRequests, setLoadingRequests] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_API_URL || '/api';
  const API_BASE = BACKEND_URL.endsWith('/api') ? BACKEND_URL : `${BACKEND_URL.replace(/\/$/, '')}/api`;

  const fetchCreditsAdminData = async () => {
    setLoadingRequests(true);
    try {
      const reqRes = await axios.get(`${API_BASE}/superadmin/credit-requests`);
      if (reqRes.data.success) {
        setCreditRequests(reqRes.data.requests);
        
        // Calculate statistics dynamically
        const reqs = reqRes.data.requests;
        const pending = reqs.filter(r => r.status === 'pending').length;
        const approved = reqs.filter(r => r.status === 'approved').length;
        const rejected = reqs.filter(r => r.status === 'rejected').length;
        
        setCreditsStats(prev => ({
          ...prev,
          pendingCount: pending,
          approvedCount: approved,
          rejectedCount: rejected
        }));
      }
      
      const txRes = await axios.get(`${API_BASE}/superadmin/credit-transactions`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (txRes.data.success) {
        setCreditTransactions(txRes.data.transactions);
        
        // Calculate credits stats
        const txs = txRes.data.transactions;
        const totalAssigned = txs
          .filter(t => t.transaction_type === 'credit_added' || t.transaction_type === 'credit_request_approved')
          .reduce((sum, t) => sum + t.credits, 0);
          
        const totalUsed = txs
          .filter(t => t.transaction_type === 'credit_used')
          .reduce((sum, t) => sum + t.credits, 0);

        setCreditsStats(prev => ({
          ...prev,
          totalAssigned,
          totalUsed
        }));
      }

      const confRes = await axios.get(`${API_BASE}/superadmin/credit-config`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (confRes.data.success) {
        setCreditConfigs(confRes.data.config);
      }
    } catch (err) {
      console.error('Error fetching admin credits data:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchCreditsAdminData();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await axios.post(`${API_BASE}/superadmin/credit-requests/${id}/approve`);
      if (res.data.success) {
        toast.success('Credits added successfully.');
        fetchCreditsAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await axios.post(`${API_BASE}/superadmin/credit-requests/${id}/reject`);
      if (res.data.success) {
        toast.success('Credit request rejected.');
        fetchCreditsAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleUpdateConfig = async (key, cost) => {
    try {
      const res = await axios.put(`${API_BASE}/superadmin/credit-config/${key}`, { credit_cost: cost }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (res.data.success) {
        toast.success('Configuration updated');
        setEditingConfig(null);
        fetchCreditsAdminData();
      }
    } catch (err) {
      toast.error('Failed to update config');
    }
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Mock statistics data
  const stats = [
    { label: 'Total Channels', value: '38', change: '+12%', color: 'from-blue-600 to-cyan-500', icon: <Radio className="text-white" size={24} /> },
    { label: 'Total Institutes', value: '142', change: '+8%', color: 'from-indigo-600 to-purple-500', icon: <Building2 className="text-white" size={24} /> },
    { label: 'Total Managers', value: '89', change: '+15%', color: 'from-violet-600 to-fuchsia-500', icon: <UserCheck className="text-white" size={24} /> },
    { label: 'Total Students', value: '14,820', change: '+24%', color: 'from-pink-600 to-rose-500', icon: <GraduationCap className="text-white" size={24} /> },
    { label: 'Total Users', value: '19,240', change: '+18%', color: 'from-amber-600 to-orange-500', icon: <Users className="text-white" size={24} /> },
    { label: 'Active Users', value: '5,310', change: '+32%', color: 'from-emerald-600 to-teal-500', icon: <Activity className="text-white" size={24} /> },
  ];

  // Mock table & list contents for secondary views to make the app feel alive and detailed
  const channels = [
    { id: '1', name: 'Alpha Corporate', code: 'CH-ALP', institute: 'Delhi Tech', students: 1250, status: 'active' },
    { id: '2', name: 'Beta Learning', code: 'CH-BET', institute: 'Mumbai Academy', students: 840, status: 'active' },
    { id: '3', name: 'Gamma Skills', code: 'CH-GAM', institute: 'Bangalore Institute', students: 2310, status: 'active' },
    { id: '4', name: 'Delta Executive', code: 'CH-DEL', institute: 'Kolkata Center', students: 430, status: 'inactive' },
  ];

  const institutes = [
    { id: '1', name: 'National Institute of GST Studies', city: 'New Delhi', courses: 8, head: 'Dr. Ramesh Kumar', status: 'active' },
    { id: '2', name: 'Apex Business Academy', city: 'Mumbai', courses: 5, head: 'Sarah D\'souza', status: 'active' },
    { id: '3', name: 'Vanguard Tax School', city: 'Chennai', courses: 4, head: 'M. K. Stalin', status: 'active' },
    { id: '4', name: 'Eastern Commerce Center', city: 'Kolkata', courses: 2, head: 'A. Chatterjee', status: 'inactive' },
  ];

  const managers = [
    { id: '1', name: 'Anil Mehta', email: 'anil@dbiz.com', channel: 'Alpha Corporate', region: 'North', status: 'active' },
    { id: '2', name: 'Priyah Sharma', email: 'priya@dbiz.com', channel: 'Beta Learning', region: 'West', status: 'active' },
    { id: '3', name: 'Karthik Raja', email: 'karthik@dbiz.com', channel: 'Gamma Skills', region: 'South', status: 'active' },
    { id: '4', name: 'Debashis Roy', email: 'debashis@dbiz.com', channel: 'Delta Executive', region: 'East', status: 'inactive' },
  ];

  // Menu items list
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Channels', icon: <Radio size={20} /> },
    { name: 'Institutes', icon: <Building2 size={20} /> },
    { name: 'Managers', icon: <UserCheck size={20} /> },
    { name: 'Students', icon: <GraduationCap size={20} /> },
    { name: 'Credit Requests', icon: <Coins size={20} /> },
    { name: 'Credit Transactions', icon: <History size={20} /> },
    { name: 'User Management', icon: <Users size={20} /> },
    { name: 'System Roles', icon: <ShieldAlert size={20} /> },
    { name: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#060B18] text-slate-100 flex overflow-hidden">
      
      {/* Sidebar Panel */}
      <aside className="w-72 bg-[#0B0F1E] border-r border-slate-800/60 flex flex-col justify-between shrink-0 z-20">
        <div>
          {/* Sidebar Header / Logo */}
          <div className="h-20 flex items-center gap-3 px-8 border-b border-slate-800/40">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-wide text-lg block">DBIZ CRM</span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block -mt-1">Super Console</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
            {menuItems.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200 group relative
                    ${isActive 
                      ? 'text-white bg-indigo-600 shadow-[0_4px_20px_rgba(99,102,241,0.25)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                >
                  <span className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="activeSideIndicator"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-white rounded-l-full" 
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Logout */}
        <div className="p-4 border-t border-slate-800/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold text-rose-400 hover:text-white hover:bg-rose-500/10 transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

        {/* Top Navbar */}
        <header className="h-20 border-b border-slate-800/60 bg-[#070C1B]/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
            <span>Enterprise</span>
            <span className="text-slate-600">/</span>
            <span className="text-white">{activeTab}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-64 hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl text-xs text-white placeholder:text-slate-600 bg-white/[0.02] border border-slate-800 outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            <button className="relative w-10 h-10 rounded-xl bg-white/[0.02] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-indigo-500/10">
                SA
              </div>
            </div>
          </div>
        </header>

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
                  <div className="relative overflow-hidden rounded-[2rem] border border-slate-800/80 bg-gradient-to-br from-[#101730] to-[#0A0D1B] p-8 md:p-10 shadow-2xl">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
                    <div className="relative z-10 space-y-4 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                        <Activity size={14} className="text-indigo-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Live Dashboard</span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        Welcome Super Admin
                      </h1>
                    </div>
                  </div>
                </>
              )}

              {/* RENDER VIEW: CREDIT REQUESTS */}
              {activeTab === 'Credit Requests' && (
                <div className="bg-[#0A0F20] border border-slate-800/80 rounded-[2rem] p-8 shadow-xl">
                  {creditRequests.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 text-sm">
                      No credit requests submitted by students yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <th className="py-4 px-4">Student Info</th>
                            <th className="py-4 px-4">Requested Credits</th>
                            <th className="py-4 px-4">Status</th>
                            <th className="py-4 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-sm">
                          {creditRequests.map((reqItem) => (
                            <tr key={reqItem.id}>
                              <td className="py-4 px-4 text-white">{reqItem.student_name}</td>
                              <td className="py-4 px-4 text-indigo-400 font-bold">+{reqItem.requested_credits}</td>
                              <td className="py-4 px-4 text-slate-300">{reqItem.status}</td>
                              <td className="py-4 px-4 text-right">
                                {reqItem.status === 'pending' && (
                                  <button onClick={() => handleApprove(reqItem.id)} className="bg-emerald-600 px-3 py-1 rounded">Approve</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* RENDER VIEW: CREDIT TRANSACTIONS */}
              {activeTab === 'Credit Transactions' && (
                <div className="bg-[#0A0F20] border border-slate-800/80 rounded-[2rem] p-8 shadow-xl">
                  <table className="w-full">
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {creditTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="py-4 px-4 text-white">{tx.student_name}</td>
                          <td className="py-4 px-4 text-indigo-400">{tx.transaction_type}</td>
                          <td className="py-4 px-4 font-bold text-slate-300">{tx.balance_after}</td>
                          <td className="px-4 py-3 text-sm">{tx.description || '-'}</td>
                          <td className="px-4 py-3 text-sm">{new Date(tx.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* RENDER VIEW: REGISTRATION CONFIG */}
              {activeTab === 'Registration Config' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <SettingsIcon size={20} className="text-indigo-500" />
                        Registration Credits Configuration
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">Manage credit costs for each stage of the GST Registration workflow.</p>
                    </div>
                  </div>
                  <div className="p-0">
                    <table className="w-full">
                      <thead className="bg-slate-50/50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action Key</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stage Description</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Credit Cost</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {creditConfigs.map((config) => (
                          <tr key={config.action_key} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{config.action_key}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{config.action_name}</td>
                            <td className="px-6 py-4 text-sm">
                              {editingConfig === config.action_key ? (
                                <input 
                                  type="number" 
                                  id={`input-${config.action_key}`}
                                  defaultValue={config.credit_cost}
                                  className="w-20 px-2 py-1 border border-slate-300 rounded text-black"
                                />
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                                  <Coins size={14} />
                                  {config.credit_cost}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              {editingConfig === config.action_key ? (
                                <>
                                  <button onClick={() => handleUpdateConfig(config.action_key, parseInt(document.getElementById(`input-${config.action_key}`).value))} className="text-emerald-600 hover:text-emerald-700 text-sm font-bold">Save</button>
                                  <button onClick={() => setEditingConfig(null)} className="text-slate-400 hover:text-slate-600 text-sm">Cancel</button>
                                </>
                              ) : (
                                <button onClick={() => setEditingConfig(config.action_key)} className="text-indigo-600 hover:text-indigo-700 text-sm font-bold">Edit</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* RENDER VIEW: SYSTEM ROLES */}
              {activeTab === 'System Roles' && (
                <div className="bg-white p-8 rounded-[2rem] shadow-xl text-slate-800">
                  <SystemRole />
                </div>
              )}

              {/* RENDER VIEW: USER MANAGEMENT */}
              {activeTab === 'User Management' && (
                <div className="bg-white p-8 rounded-[2rem] shadow-xl text-slate-800">
                  <UserManagement />
                </div>
              )}

              {/* OTHER MOCK TAB VIEWS */}
              {['Students', 'Settings'].includes(activeTab) && (
                <div className="bg-[#0A0F20] border border-slate-800/80 rounded-[2rem] p-8 shadow-xl">
                  <div className="text-center py-16 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                      <Shield size={32} />
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                      <h3 className="text-xl font-bold text-white">{activeTab} Control Center</h3>
                      <p className="text-slate-400 text-sm">
                        This section lists and allows modifications of system-wide {activeTab.toLowerCase()}. Advanced security parameters are actively enforced for the Super Admin panel.
                      </p>
                    </div>
                    <div className="inline-flex gap-3">
                      <button className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors">
                        Configure Settings
                      </button>
                      <button className="px-5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-slate-300 font-bold text-xs transition-colors">
                        Load Backup Records
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
