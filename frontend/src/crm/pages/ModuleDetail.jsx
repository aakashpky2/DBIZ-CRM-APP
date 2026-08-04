import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  PlayCircle, 
  FileText, 
  Video, 
  HelpCircle, 
  Info,
  Layout,
  CheckCircle2,
  Clock,
  Download
} from 'lucide-react';
import { gstModules } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearningSession } from '../hooks/useLearningSession';

const ModuleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [actionLoading, setActionLoading] = useState(false);
  
  const module = gstModules.find(m => m.id === parseInt(id)) || gstModules[0];
  const { isActive, activeDuration, creditsBurned } = useLearningSession(module.title);

  const tabs = ['Overview', 'Lessons', 'Videos', 'Forms', 'Templates', 'FAQs', 'Updates'];

  const lessons = [
    { id: 1, title: 'Introduction to GST Registration', duration: '12:00', completed: true },
    { id: 2, title: 'Eligibility Criteria for Registration', duration: '15:30', completed: true },
    { id: 3, title: 'Documents Required for Registration', duration: '08:45', completed: false },
    { id: 4, title: 'Step-by-Step Registration Guide', duration: '25:00', completed: false },
  ];

  const handlePremiumAction = async (actionKey, actionName) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const res = await axios.post(`${API_URL}/session/premium-action`, 
        { actionKey, moduleName: module.title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        toast.success(`${actionName} Successful! ${res.data.cost} Credits Deducted.`);
      }
    } catch (err) {
      if (err.response?.status === 402) {
        toast.error('Insufficient Credits for this premium action.');
      } else {
        toast.error('Failed to perform premium action.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 relative">
      
      {/* Floating Session Widget */}
      <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border flex flex-col items-center gap-1 transition-all ${isActive ? 'bg-cyan-50 border-cyan-200' : 'bg-slate-100 border-slate-300 opacity-70'}`}>
        <div className="flex items-center gap-2">
           <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-cyan-500 animate-pulse' : 'bg-slate-400'}`}></div>
           <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{isActive ? 'Session Active' : 'Session Paused'}</span>
        </div>
        <div className="text-xl font-black text-slate-900">
           {Math.floor(activeDuration / 60)}:{(activeDuration % 60).toString().padStart(2, '0')}
        </div>
        {creditsBurned > 0 && <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1">-{creditsBurned} Credits Burned</div>}
      </div>

      <button 
        onClick={() => navigate('/modules')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-all group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-all" />
        Back to Modules
      </button>

      {/* Module Header Card */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-${module.color}-500/5 blur-[100px] rounded-full`} />
        
        <div className="md:flex items-start justify-between gap-10 relative z-10">
          <div className="flex-1 space-y-6">
            <div className={`w-16 h-16 rounded-2xl bg-${module.color}-50 flex items-center justify-center`}>
              {module.icon}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{module.title}</h1>
              <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">{module.description}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">Total: 4.5 Hours</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Layout size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">{module.lessons} Lessons</span>
              </div>
            </div>
          </div>

          <div className="mt-10 md:mt-0 w-full md:w-80 bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Module Progress</p>
            <div className="text-3xl font-bold text-slate-900 mb-2">{module.completion}%</div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-6">
              <div 
                className={`h-full bg-${module.color}-500 rounded-full transition-all duration-1000`} 
                style={{ width: `${module.completion}%` }}
              />
            </div>
            <button className={`w-full py-4 rounded-2xl font-bold text-sm bg-${module.color}-500 text-white shadow-lg shadow-${module.color}-500/20 hover:scale-105 active:scale-95 transition-all`}>
              Resume Module
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-8 py-4 border-b border-slate-50 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab 
                ? `bg-${module.color}-50 text-${module.color}-600` 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'Lessons' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {lessons.map((lesson) => (
                  <div 
                    key={lesson.id}
                    className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        lesson.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 group-hover:bg-white group-hover:text-slate-900'
                      }`}>
                        {lesson.completed ? <CheckCircle2 size={24} /> : <PlayCircle size={24} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">{lesson.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lesson.duration}</span>
                          {lesson.completed && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg">Completed</span>}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handlePremiumAction('generate_pdf', 'Download PDF')}
                      disabled={actionLoading}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-50"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'Overview' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="prose prose-slate max-w-none"
              >
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-900">What you'll learn</h3>
                    <ul className="space-y-4">
                      {[
                        'Comprehensive understanding of GST legal framework',
                        'Hands-on experience with the GST portal',
                        'Handling registration for various business types',
                        'Amendments and cancellations in GST registration'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 font-medium text-slate-600">
                          <div className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-${module.color}-500 shrink-0`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-900">Prerequisites</h3>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-white text-slate-900 border border-slate-200">
                        <Info size={20} />
                      </div>
                      <p className="text-slate-600 font-medium">Basic knowledge of Indian Taxation system is recommended but not mandatory for this introductory module.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab !== 'Lessons' && activeTab !== 'Overview' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6 border border-slate-100 border-dashed">
                  <Layout size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Coming Soon</h3>
                <p className="text-slate-500 font-medium">We're currently updating the {activeTab} for this module.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;
