import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Play, 
  Award, 
  BookOpen, 
  Clock, 
  ChevronRight,
  Zap,
  CheckCircle2,
  Calendar,
  Calculator,
  Download,
  ListChecks,
  Coins,
  History,
  PlusCircle,
  X,
  Wallet,
  Users,
  Briefcase,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Flame,
  Bell,
  FileText,
  UserPlus,
  CheckSquare,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { fetchVideos } from '../services/VideoService';
import VideoCard from '../components/VideoCard';

// Beautiful premium mock data for charts and cards
const learningWeeklyActivity = [
  { name: 'Mon', hours: 2.4 },
  { name: 'Tue', hours: 4.1 },
  { name: 'Wed', hours: 1.8 },
  { name: 'Thu', hours: 3.5 },
  { name: 'Fri', hours: 5.0 },
  { name: 'Sat', hours: 1.2 },
  { name: 'Sun', hours: 2.8 }
];

const completionStats = [
  { name: 'GST', pct: 60 },
  { name: 'Tax', pct: 40 },
  { name: 'ROC', pct: 25 },
  { name: 'Audit', pct: 10 },
  { name: 'Payroll', pct: 50 },
  { name: 'Accounting', pct: 30 }
];

const recentActivities = [
  { id: 1, type: 'view', desc: 'Viewed topic "GST Registration on MCA V3"', time: '2 hours ago', icon: <BookOpen className="text-blue-500" size={16} /> },
  { id: 2, type: 'quiz', desc: 'Completed quiz "Presumptive Tax Sec 44AD" - 90%', time: 'Yesterday', icon: <Award className="text-emerald-500" size={16} /> },
  { id: 3, type: 'download', desc: 'Downloaded template "PF Monthly ECR Calculator"', time: '2 days ago', icon: <Download className="text-purple-500" size={16} /> },
  { id: 4, type: 'complete', desc: 'Finished Module "Introduction to Direct Taxes"', time: '3 days ago', icon: <CheckCircle2 className="text-cyan-500" size={16} /> }
];

const complianceNotifications = [
  { id: 1, title: 'GST GSTR-1 Monthly Return Filing Due', date: 'May 31, 2026', badge: 'GST', status: 'Immediate', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 2, title: 'Quarterly TDS Return Filing Form 24Q/26Q', date: 'June 15, 2026', badge: 'Income Tax', status: 'Upcoming', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 3, title: 'ROC Form DIR-3 KYC Director Annual Renewal', date: 'June 30, 2026', badge: 'ROC Compliance', status: 'Normal', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 4, title: 'Labor Department Half-Yearly Returns Submission', date: 'July 15, 2026', badge: 'Payroll', status: 'Pending', color: 'bg-slate-100 text-slate-700 border-slate-200' }
];

const serviceLearningCards = [
  { label: 'GST', key: 'gst', desc: 'Indirect taxation registry, filings, GSTR-1/3B notices.', lessons: '56', progress: 60, color: 'from-blue-600 to-cyan-500', bg: 'bg-blue-50/50' },
  { label: 'Income Tax', key: 'income-tax', desc: 'ITR calculations, direct taxes, Section 80C deductions.', lessons: '48', progress: 40, color: 'from-emerald-600 to-teal-500', bg: 'bg-emerald-50/50' },
  { label: 'ROC Compliance', key: 'roc-compliance', desc: 'MCA annual returns, company minutes, secretarial filing.', lessons: '32', progress: 25, color: 'from-purple-600 to-indigo-500', bg: 'bg-purple-50/50' },
  { label: 'Company Registration', key: 'company-registration', desc: 'Incorporate Pvt Ltd, LLP, Partnership, Startup benefits.', lessons: '24', progress: 15, color: 'from-indigo-600 to-blue-500', bg: 'bg-indigo-50/50' },
  { label: 'Trademark', key: 'trademark', desc: 'Vienna public search, class cataloging, objections response.', lessons: '18', progress: 0, color: 'from-cyan-600 to-sky-500', bg: 'bg-cyan-50/50' },
  { label: 'Payroll & HR', key: 'payroll-hr', desc: 'Salary breakups, PF ECR sheets, ESI portals, labour norms.', lessons: '38', progress: 50, color: 'from-pink-600 to-rose-500', bg: 'bg-pink-50/50' },
  { label: 'Accounting', key: 'accounting', desc: 'Bookkeeping entries, automated trial ledger, balance sheets.', lessons: '44', progress: 30, color: 'from-amber-600 to-orange-500', bg: 'bg-amber-50/50' },
  { label: 'Audit & Assurance', key: 'audit', desc: 'Statutory audit planning, CARO reports, work checklists.', lessons: '28', progress: 10, color: 'from-rose-600 to-pink-500', bg: 'bg-rose-50/50' }
];

const crmMetrics = [
  { label: 'Active Clients', value: '142', sub: '3 new this week', icon: <Users className="text-cyan-600" size={20} /> },
  { label: 'Pending Works', value: '28', sub: '12 high priority', icon: <Briefcase className="text-indigo-600" size={20} /> },
  { label: 'Scheduled Follow-ups', value: '45', sub: 'For GST/ITR audits', icon: <History className="text-purple-600" size={20} /> },
  { label: 'Monthly Revenue', value: '₹4.8L', sub: '+18% growth month-on-month', icon: <TrendingUp className="text-emerald-600" size={20} /> }
];

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Student Credit System States
  const [credits, setCredits] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqAmount, setReqAmount] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [reqLoading, setReqLoading] = useState(false);

  // Watch History State
  const [watchHistory, setWatchHistory] = useState([]);
  const [todaysStats, setTodaysStats] = useState({ watchSeconds: 0, creditsBurned: 0, videosCompleted: 0 });

  // Videos State
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);



  const fetchCreditsData = async () => {
    try {
      const credRes = await api.get(`/student/credits`);
      if (credRes.data.success) {
        setCredits(credRes.data.credits);
      }
      const txRes = await api.get(`/student/credits/transactions`);
      if (txRes.data.success) {
        setTransactions(txRes.data.transactions);
      }
      
      const histRes = await api.get(`/video/watch-history`);
      if (histRes.data.success) {
        setWatchHistory(histRes.data.sessions);
        
        // Calculate Today's Stats
        const today = new Date();
        let tSeconds = 0;
        let tCredits = 0;
        let vCompleted = 0;
        
        histRes.data.sessions.forEach(session => {
          const sDate = new Date(session.updated_at || session.created_at);
          if (sDate.toDateString() === today.toDateString()) {
            tSeconds += session.watch_seconds || 0;
            tCredits += session.credits_burned || 0;
          }
          if (session.status === 'completed') {
            vCompleted += 1;
          }
        });
        
        setTodaysStats({ watchSeconds: tSeconds, creditsBurned: tCredits, videosCompleted: vCompleted });
      }
    } catch (err) {
      console.error('Error fetching credits data:', err);
    }
  };

  const loadVideos = async () => {
    try {
      setLoadingVideos(true);
      const res = await fetchVideos();
      setVideos(res.data.videos || []);
    } catch (e) {
      console.error('Error fetching videos:', e);
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (user?.role === 'student') {
      fetchCreditsData();
      loadVideos();
    }
  }, [user]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!reqAmount || parseInt(reqAmount) <= 0) {
      toast.error('Please enter a valid credit amount.');
      return;
    }
    if (!reqReason.trim()) {
      toast.error('Please enter a reason for the credit request.');
      return;
    }

    setReqLoading(true);
    try {
      const res = await api.post(`/student/credits/request`, {
        requested_credits: parseInt(reqAmount),
        reason: reqReason.trim()
      });

      if (res.data.success) {
        toast.success('Credit request submitted successfully.');
        setShowReqModal(false);
        fetchCreditsData(); // Refresh history
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit credit request.');
    } finally {
      setReqLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    toast.success(`Action Executed: ${action}`);
  };

  const startLearning = (key) => {
    navigate(`/learning/${key}`);
  };

  const formatWatchTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-10 pb-12 font-sans bg-[#F8FAFC]">
      
      {/* 1. Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 md:p-10 shadow-sm"
      >
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-cyan-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="relative z-10 md:flex items-center justify-between gap-10">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 rounded-full border border-cyan-100">
              <Flame size={14} className="text-cyan-600 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">3-Day Study Streak!</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome back, {user?.username?.split('@')[0] || 'Student'}!
            </h1>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed">
              Accelerate your accounting career and master legal services. You have completed 25% of your professional certification goals.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button 
                onClick={() => startLearning('gst')}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-cyan-600/10 active:scale-95"
              >
                <Play size={16} fill="currentColor" />
                Continue Learning GST
              </button>
              <button 
                onClick={() => handleQuickAction('Explore Courses')}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all active:scale-95"
              >
                Explore Services
              </button>
            </div>
          </div>
          
          <div className="hidden md:flex flex-col items-center gap-2 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] w-48 shrink-0">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-250" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="188.4" className="text-cyan-600" />
              </svg>
              <Award className="absolute text-cyan-600" size={32} />
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">25%</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Goals Met</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Service Learning Cards Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">SaaS Learning & Compliance Services</h2>
          <p className="text-slate-500 text-sm mt-0.5">Explore beginner-to-advanced curriculums on corporate governance and tax filing.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceLearningCards.map((service, i) => (
            <motion.div 
              key={service.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-md`}>
                    <BookOpen className="text-white" size={22} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                    {videos.filter(v => v.category === service.label).length} Lessons
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-950 group-hover:text-cyan-600 transition-colors text-base">
                    {service.label}
                  </h3>
                  <p className="text-xs text-slate-450 leading-relaxed min-h-[36px]">
                    {service.desc}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mt-6 pt-4 border-t border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>Progress</span>
                    <span>{service.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${service.color}`} style={{ width: `${service.progress}%` }} />
                  </div>
                </div>

                <button 
                  onClick={() => startLearning(service.key)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-cyan-50 hover:text-cyan-600 text-slate-700 rounded-xl font-bold text-xs transition-all active:scale-[0.98]"
                >
                  Start Learning
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Learning Progress and Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recharts Weekly Activity and Completion Stats */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Analytics & Activity</h2>
              <p className="text-xs text-slate-500">Your visual study progress across legal platforms</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold px-3 py-1 bg-cyan-50 text-cyan-600 rounded-full border border-cyan-100 flex items-center gap-1">
                <Clock size={12} /> Live Tracking
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Weekly Activity Bar Chart */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>Study Hours / Day</span>
                <span className="text-cyan-600">Avg: 3.2h</span>
              </div>
              <div className="h-[200px] w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={learningWeeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} />
                      <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                      <Bar dataKey="hours" radius={[4, 4, 0, 0]} barSize={24}>
                        {learningWeeklyActivity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.hours > 3 ? '#0EA5E9' : '#E2E8F0'} className="transition-all hover:fill-cyan-500" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Course Completion Line Chart */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>Completion Status / Service</span>
                <span className="text-purple-600">Avg: 36%</span>
              </div>
              <div className="h-[200px] w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={completionStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                      <Line type="monotone" dataKey="pct" stroke="#8B5CF6" strokeWidth={3} activeDot={{ r: 6 }} dot={{ fill: '#8B5CF6', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right 1 Col: Quick Action Grid */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950 mb-1">Interactive Console</h2>
            <p className="text-xs text-slate-500 mb-6">Quick actions to execute compliance work and tasking</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Calculator size={18} />, label: 'GST Calculator', action: 'GST Calculator' },
                { icon: <Download size={18} />, label: 'Form Templates', action: 'Download Templates' },
                { icon: <Calendar size={18} />, label: 'ROC Due Dates', action: 'View Due Dates' },
                { icon: <ListChecks size={18} />, label: 'Filing Checklist', action: 'Compliance Checklist' },
                { icon: <UserPlus size={18} />, label: 'Add Client', action: 'Add CRM Client' },
                { icon: <CheckSquare size={18} />, label: 'Create Task', action: 'Create CRM Task' },
              ].map((action, i) => (
                <button 
                  key={i} 
                  onClick={() => handleQuickAction(action.action)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-cyan-50 hover:text-cyan-600 border border-transparent transition-all hover:shadow-sm active:scale-95 group"
                >
                  <div className="w-10 h-10 bg-white border border-slate-100 text-slate-500 rounded-xl flex items-center justify-center mb-2 transition-all group-hover:scale-110 group-hover:border-cyan-200">
                    {action.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 text-center tracking-wide">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 & 5. Recent Activity and Compliance Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Learning Activity */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-950">Recent Activity Log</h2>
            <span className="text-xs font-semibold text-slate-400">History</span>
          </div>
          <div className="space-y-4">
            {watchHistory.length === 0 && <p className="text-sm text-slate-500">No watch activity yet.</p>}
            {watchHistory.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-150 flex items-center justify-center shrink-0">
                  <Play className="text-cyan-500" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    Watched "{session.learning_videos?.title || 'Video'}"
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold flex items-center gap-2">
                    <span>{formatWatchTime(session.watch_seconds)}</span>
                    <span>•</span>
                    <span className="text-rose-500">Burned {session.credits_burned} credits</span>
                    <span>•</span>
                    <span>{new Date(session.updated_at || session.created_at).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Updates Notification Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-950">Compliance & Regulatory Circulars</h2>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="space-y-4">
            {complianceNotifications.map((notif) => (
              <div key={notif.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-50 text-cyan-600 border border-cyan-150">
                      {notif.badge}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">{notif.date}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate" title={notif.title}>{notif.title}</p>
                </div>
                <span className={`text-[9px] px-2 py-1 rounded-lg font-bold border shrink-0 ${notif.color}`}>
                  {notif.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. CRM Analytics Overview */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">CRM Operations</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage live clients and audit operations securely.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {crmMetrics.map((metric, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-all duration-300"
            >
              <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                {metric.icon}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none">{metric.label}</p>
                <p className="text-3xl font-extrabold text-slate-950 mt-1">{metric.value}</p>
                <p className="text-[10px] text-slate-550 font-medium leading-none">{metric.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 7. Student Credit Wallet System (Maintaining Complete Compatibility) */}
      {user?.role === 'student' && (
        <div className="space-y-6 mt-8">
          <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Coins className="text-cyan-500 animate-bounce" size={26} />
                Credit Wallet System
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">Manage your learning service tokens and active credits</p>
            </div>
            <button
              onClick={() => { setReqAmount(''); setReqReason(''); setShowReqModal(true); }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl font-bold text-sm transition-all hover:bg-cyan-700 active:scale-95 shadow-sm shadow-cyan-600/10 self-start sm:self-auto"
            >
              <PlusCircle size={16} />
              Request Credits
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Credits */}
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-500/10 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-2 translate-y-2 pointer-events-none">
                <Coins size={140} />
              </div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Total Credits Assigned</p>
              <p className="text-4xl font-extrabold mt-2">{credits?.total_credits ?? 0}</p>
              <div className="mt-4 flex items-center gap-2 text-indigo-100/80 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Accumulated learning credits</span>
              </div>
            </div>

            {/* Used Credits */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-500/10 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-2 translate-y-2 pointer-events-none">
                <Coins size={140} />
              </div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Used Credits</p>
              <p className="text-4xl font-extrabold mt-2">{credits?.used_credits ?? 0}</p>
              <div className="mt-4 flex items-center justify-between text-emerald-100/80 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Credits Burned Today: <strong className="text-white">{todaysStats.creditsBurned}</strong></span>
                </div>
              </div>
            </div>

            {/* Remaining Credits */}
            <div className="bg-gradient-to-br from-cyan-500 to-sky-600 p-6 rounded-3xl text-white shadow-lg shadow-cyan-500/10 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-2 translate-y-2 pointer-events-none">
                <Coins size={140} />
              </div>
              <p className="text-cyan-100 text-xs font-bold uppercase tracking-wider">Remaining Credits</p>
              <p className="text-4xl font-extrabold mt-2">{credits?.remaining_credits ?? 0}</p>
              <div className="mt-4 flex items-center gap-2 text-cyan-100/80 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${credits?.remaining_credits > 10 ? 'bg-white' : 'bg-red-400 animate-ping'}`} />
                <span>{credits?.remaining_credits === 0 ? 'Insufficient credits - request more' : 'Active and available to burn'}</span>
              </div>
            </div>
            
            {/* Today's Watch Stats */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-purple-500/10 relative overflow-hidden md:col-span-3 lg:col-span-1">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-2 translate-y-2 pointer-events-none">
                <Clock size={140} />
              </div>
              <p className="text-purple-100 text-xs font-bold uppercase tracking-wider">Today's Watch Time</p>
              <p className="text-4xl font-extrabold mt-2">{formatWatchTime(todaysStats.watchSeconds)}</p>
              <div className="mt-4 flex items-center justify-between text-purple-100/80 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Videos Completed Total: <strong className="text-white">{todaysStats.videosCompleted}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Usage History Table */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 overflow-hidden">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <History size={18} className="text-slate-500" />
              Credit Transaction History
            </h3>
            {transactions.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                No credit transactions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="py-3 px-4">Transaction Type</th>
                      <th className="py-3 px-4">Credits</th>
                      <th className="py-3 px-4">Balance After</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const typeColors = {
                        credit_added: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                        credit_used: 'bg-rose-50 text-rose-700 border-rose-100',
                        credit_request_approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                        credit_request_rejected: 'bg-red-50 text-red-700 border-red-100',
                      };
                      const typeLabels = {
                        credit_added: 'Credit Added',
                        credit_used: 'Credit Used',
                        credit_request_approved: 'Request Approved',
                        credit_request_rejected: 'Request Rejected',
                      };
                      return (
                        <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all font-medium text-slate-700">
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${typeColors[tx.transaction_type] || 'bg-slate-50 text-slate-600'}`}>
                              {typeLabels[tx.transaction_type] || tx.transaction_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {tx.transaction_type === 'credit_used' || tx.transaction_type === 'credit_request_rejected' ? '-' : '+'}{tx.credits}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{tx.balance_after}</td>
                          <td className="py-3.5 px-4 text-slate-500">{tx.description}</td>
                          <td className="py-3.5 px-4 text-slate-400 text-xs">
                            {new Date(tx.created_at).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Latest Learning Videos Section */}
      {user?.role === 'student' && (
        <div className="space-y-4 mt-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Latest Learning Videos</h2>
            <p className="text-slate-500 text-sm mt-0.5">Watch new learning content uploaded by the Admin.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingVideos ? (
              <p className="text-slate-500">Loading videos...</p>
            ) : videos.length === 0 ? (
              <p className="text-slate-500 col-span-full bg-white p-6 rounded-2xl border border-slate-100 text-center">No learning videos available yet.</p>
            ) : (
              videos.map((vid) => (
                <div key={vid.id}>
                  <VideoCard video={vid} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Request Credits Modal */}
      {showReqModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Coins className="text-cyan-500" size={24} />
                <h3 className="text-xl font-black text-slate-850">Request Credits</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReqModal(false)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-650 hover:bg-slate-50 active:scale-95 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form id="request-credits-form" onSubmit={handleRequestSubmit} className="p-8 space-y-6">
              {/* Requested credits */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Requested Credits *</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 50"
                  value={reqAmount}
                  onChange={e => setReqAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason / Message *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Tell the Super Admin why you need more credits..."
                  value={reqReason}
                  onChange={e => setReqReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all resize-none"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => setShowReqModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="request-credits-form"
                disabled={reqLoading}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-cyan-600/15 transition-all"
              >
                {reqLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
