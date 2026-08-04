import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Bell, 
  BookOpen, 
  User, 
  ShieldCheck, 
  Settings, 
  CheckCircle2, 
  RefreshCw,
  MoreVertical,
  X
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const getNotificationIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'learning':
      return <BookOpen size={20} className="text-cyan-600" />;
    case 'account':
      return <User size={20} className="text-emerald-600" />;
    case 'institute':
    case 'admin':
      return <ShieldCheck size={20} className="text-indigo-600" />;
    case 'system':
      return <Settings size={20} className="text-rose-600" />;
    default:
      return <Bell size={20} className="text-slate-600" />;
  }
};

const getNotificationBg = (type) => {
  switch (type?.toLowerCase()) {
    case 'learning': return 'bg-cyan-50 border-cyan-100';
    case 'account': return 'bg-emerald-50 border-emerald-100';
    case 'institute':
    case 'admin': return 'bg-indigo-50 border-indigo-100';
    case 'system': return 'bg-rose-50 border-rose-100';
    default: return 'bg-slate-50 border-slate-100';
  }
};

const Notifications = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    fetchNotifications 
  } = useNotifications();
  
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setIsRefreshing(false), 500); // Visual feedback
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.redirect_url) {
      navigate(notification.redirect_url);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Apply tab filter
      if (filter === 'Unread' && n.is_read) return false;
      if (filter === 'Read' && !n.is_read) return false;
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          n.title?.toLowerCase().includes(query) ||
          n.message?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [notifications, filter, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-slate-500 text-sm">Stay updated with your latest alerts</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isRefreshing}
            title="Refresh notifications"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={markAllAsRead}
            disabled={notifications.filter(n => !n.is_read).length === 0}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span className="hidden sm:inline">Mark all as read</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['All', 'Unread', 'Read'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {tab === 'Unread' && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px]">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search notifications..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 rounded-xl text-sm transition-all outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw size={32} className="animate-spin text-cyan-500 mb-4" />
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <AnimatePresence>
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                  !notification.is_read 
                    ? 'bg-white border-cyan-100 shadow-md shadow-cyan-500/5 hover:border-cyan-300' 
                    : 'bg-slate-50/50 border-slate-200 hover:bg-white hover:shadow-sm'
                }`}
              >
                {!notification.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
                )}
                
                <div className="flex gap-4">
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border ${getNotificationBg(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className={`font-semibold truncate ${!notification.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs font-medium text-slate-400 whitespace-nowrap bg-white px-2 py-1 rounded-lg border border-slate-100 shrink-0">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className={`text-sm line-clamp-2 ${!notification.is_read ? 'text-slate-600' : 'text-slate-500'}`}>
                      {notification.message}
                    </p>
                    
                    {notification.type && (
                      <div className="mt-3 inline-flex">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-100 text-slate-500">
                          {notification.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Bell size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No notifications yet</h3>
            <p className="text-slate-500 max-w-sm">
              {searchQuery 
                ? "We couldn't find any notifications matching your search."
                : filter === 'Unread' 
                  ? "You're all caught up! No unread notifications." 
                  : "When you receive notifications, they'll appear here."}
            </p>
            {(searchQuery || filter !== 'All') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilter('All');
                }}
                className="mt-6 px-4 py-2 text-cyan-600 font-medium bg-cyan-50 rounded-xl hover:bg-cyan-100 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
