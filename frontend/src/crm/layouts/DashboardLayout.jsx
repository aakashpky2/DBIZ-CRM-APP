import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Search,
  User,
  ShieldCheck,
  Calendar,
  FileText,
  ChevronDown,
  Briefcase,
  Users,
  ClipboardCheck,
  Workflow,
  Lock,
  Wallet,
  Calculator,
  SearchCheck,
  FileBadge,
  Users2,
  TableProperties,
  Landmark,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import StudentProfileDropdown from '../components/StudentProfileDropdown';

const SidebarItem = ({ icon, label, path, isOpen, isActive, onClick, hasSubmenu, isExpanded }) => {
  return (
    <div>
      <Link
        to={hasSubmenu ? '#' : path}
        onClick={onClick}
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-cyan-50 text-cyan-600 font-semibold shadow-sm' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`${isActive ? 'text-cyan-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
            {icon}
          </span>
          {isOpen && <span className="truncate">{label}</span>}
        </div>
        {isOpen && hasSubmenu && (
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className={isActive ? 'text-cyan-600' : 'text-slate-400'} />
          </motion.span>
        )}
      </Link>
    </div>
  );
};

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSubmenu = (label) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const crmMenus = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Briefcase size={20} />, label: 'Projects', path: '/projects' },
    { 
      icon: <Lock size={20} />, 
      label: 'Admin Panel', 
      submenus: [
        { label: 'System Role', path: '/system-role' },
        { label: 'User Management', path: '/user-management' },
      ] 
    },
  ];

  const learningServices = [
    {
      label: 'GST',
      icon: <FileBadge size={20} />,
      submenus: ['GST Basics', 'GST Registration', 'GST Return Filing', 'GST Notices', 'GST Penalties', 'GST Case Studies']
    },
    {
      label: 'Income Tax',
      icon: <Calculator size={20} />,
      submenus: ['Basics', 'ITR Filing', 'TDS', 'Tax Audit', 'Capital Gains', 'Income Tax Notices']
    },
    {
      label: 'ROC Compliance',
      icon: <TableProperties size={20} />,
      submenus: ['Annual Filing', 'Board Resolutions', 'MCA Forms', 'DIR/KYC', 'Compliance Calendar']
    },
    {
      label: 'Company Registration',
      icon: <Landmark size={20} />,
      submenus: ['Pvt Ltd', 'LLP', 'OPC', 'Partnership', 'Startup Registration']
    },
    {
      label: 'Trademark',
      icon: <SearchCheck size={20} />,
      submenus: ['Search', 'Filing', 'Objection Reply', 'Renewal']
    },
    {
      label: 'Payroll & HR',
      icon: <Users2 size={20} />,
      submenus: ['Salary Processing', 'PF', 'ESI', 'Labour Law', 'Payroll Compliance']
    },
    {
      label: 'Accounting',
      icon: <Wallet size={20} />,
      submenus: ['Bookkeeping', 'Journal Entries', 'Ledger', 'Balance Sheet', 'P&L']
    },
    {
      label: 'Audit',
      icon: <ShieldAlert size={20} />,
      submenus: ['Internal Audit', 'Statutory Audit', 'Audit Checklist', 'Documentation']
    }
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-20'
        } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col hidden md:flex z-20`}
      >
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/20">
            <ShieldCheck size={24} />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl text-slate-900 tracking-tight">DBiz CRM</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-8">
          {/* Main Management Section */}
          <div className="space-y-1.5">
            {isSidebarOpen && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Main Management</p>
            )}
            {crmMenus.map((item) => {
              // Hide Admin Panel completely if user does not have permission
              const hasAdminPanel = user?.role === 'superadmin' || user?.role === 'admin';

              if (item.label === 'Admin Panel' && !hasAdminPanel) {
                return null;
              }

              if (item.submenus) {
                const hasActiveSub = item.submenus.some(sub => location.pathname === sub.path);
                return (
                  <div key={item.label} className="space-y-1">
                    <SidebarItem
                      icon={item.icon}
                      label={item.label}
                      path="#"
                      isOpen={isSidebarOpen}
                      isActive={hasActiveSub}
                      hasSubmenu={true}
                      isExpanded={expandedMenus[item.label]}
                      onClick={() => toggleSubmenu(item.label)}
                    />
                    
                    <AnimatePresence>
                      {isSidebarOpen && expandedMenus[item.label] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-9 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
                            {item.submenus.map((sub) => {
                              const isSubActive = location.pathname === sub.path;
                              return (
                                <Link
                                  key={sub.label}
                                  to={sub.path}
                                  className={`block py-1.5 text-sm transition-colors ${
                                    isSubActive 
                                      ? 'text-cyan-600 font-semibold' 
                                      : 'text-slate-500 hover:text-cyan-600'
                                  }`}
                                >
                                  {sub.label}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              return (
                <SidebarItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  isOpen={isSidebarOpen}
                  isActive={location.pathname === item.path}
                />
              );
            })}
          </div>

          {/* Hierarchy Management Section */}
          {user?.permissions?.hierarchy_management && (
            <div className="space-y-1.5">
              {isSidebarOpen && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Hierarchy Management</p>
              )}
              <SidebarItem
                icon={<Users size={20} />}
                label="Team Management"
                path="/team-management"
                isOpen={isSidebarOpen}
                isActive={location.pathname === '/team-management'}
              />
            </div>
          )}

          {/* Learning Services Section */}
          {(user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'student') && (
            <div className="space-y-1.5">
              {isSidebarOpen && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Learning Services</p>
              )}
              {learningServices.map((section) => (
                <div key={section.label} className="space-y-1">
                  <SidebarItem
                    icon={section.icon}
                    label={section.label}
                    path="#"
                    isOpen={isSidebarOpen}
                    isActive={false}
                    hasSubmenu={true}
                    isExpanded={expandedMenus[section.label]}
                    onClick={() => toggleSubmenu(section.label)}
                  />
                  
                  <AnimatePresence>
                    {isSidebarOpen && expandedMenus[section.label] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-9 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
                          {section.submenus.map((sub) => {
                            if (sub === 'GST Registration') {
                              return (
                                <a
                                  key={sub}
                                  href="/gst"
                                  className="block py-1.5 text-sm text-slate-500 hover:text-cyan-600 transition-colors"
                                >
                                  {sub}
                                </a>
                              );
                            }
                            return (
                              <Link
                                key={sub}
                                to={`/learning/${section.label.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-')}`}
                                className="block py-1.5 text-sm text-slate-500 hover:text-cyan-600 transition-colors"
                              >
                                {sub}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 mt-auto border-t border-slate-100 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="relative h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg md:block hidden transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative max-w-md w-64 md:block hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-cyan-500/50 rounded-xl text-sm text-black transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/notifications')}
              className="relative text-slate-500 hover:text-slate-900 transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200">
              <StudentProfileDropdown />
            </div>
          </div>
        </header>

        {/* Page Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
