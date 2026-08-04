import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Search, Filter, ShieldAlert, Monitor, CheckCircle2, User, BookOpen } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const WatchSessionsMonitoring = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, completed, abandoned

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/video/monitoring');
      if (res.data.success) {
        setSessions(res.data.sessions || []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load watch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 border border-blue-200">ACTIVE</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">COMPLETED</span>;
      case 'abandoned':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">ABANDONED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.users?.username?.toLowerCase().includes(search.toLowerCase()) ||
                          s.learning_videos?.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Monitor className="text-cyan-600" size={28} />
            Watch Sessions Monitoring
          </h2>
          <p className="text-slate-500 text-sm mt-1">Real-time view of student video learning progress and credit burning.</p>
        </div>
        <button 
          onClick={fetchSessions}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm"
        >
          Refresh Data
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by student email or video title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 appearance-none font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading monitoring data...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-12 text-center text-slate-500">No watch sessions found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-4">Student</th>
                  <th className="pb-3 px-4">Video</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Watch Time</th>
                  <th className="pb-3 px-4">Credits Burned</th>
                  <th className="pb-3 px-4">Last Sync</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {session.users?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{session.users?.username}</p>
                          <p className="text-[10px] text-slate-500">
                            Learning Service: 
                            <span className={session.users?.learning_service_enabled ? 'text-emerald-500 font-bold ml-1' : 'text-rose-500 font-bold ml-1'}>
                              {session.users?.learning_service_enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700 max-w-[200px] truncate" title={session.learning_videos?.title}>
                      {session.learning_videos?.title || 'Unknown Video'}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Clock size={14} className="text-slate-400" />
                        {formatTime(session.watch_seconds)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-rose-600">{session.credits_burned}</span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 font-medium">
                      {new Date(session.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchSessionsMonitoring;
