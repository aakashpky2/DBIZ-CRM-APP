import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ArrowRight,
  Clock,
  BookOpen,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { gstModules } from '../data/mockData';
import { motion } from 'framer-motion';

const Modules = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="md:flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">GST Learning Modules</h1>
          <p className="text-slate-500 font-medium">Master every aspect of GST with our structured path.</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search modules..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium w-64 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-[2rem] p-8 text-white">
        <div className="md:flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <BookOpen size={32} />
            </div>
            <div>
              <p className="text-cyan-100 text-sm font-bold uppercase tracking-widest">Global Progress</p>
              <h2 className="text-2xl font-bold">1/6 Modules Completed</h2>
            </div>
          </div>
          <div className="mt-6 md:mt-0 md:text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20 mb-3">
              <CheckCircle2 size={16} className="text-cyan-300" />
              <span className="text-sm font-bold">Earned: "GST Explorer" Badge</span>
            </div>
          </div>
        </div>
        <div className="mt-8 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-cyan-100">
            <span>Overall Path Completion</span>
            <span>25%</span>
          </div>
          <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
            <div className="h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: '25%' }} />
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {gstModules.map((module, i) => (
          <motion.div 
            key={module.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -8 }}
            className="group relative bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
          >
            {module.completion === 100 && (
              <div className="absolute top-6 right-6 text-emerald-500">
                <CheckCircle2 size={24} />
              </div>
            )}
            
            <div className={`w-14 h-14 rounded-2xl bg-${module.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300`}>
              {module.icon}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">{module.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
              {module.description}
            </p>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1.5 text-slate-400">
                <BookOpen size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{module.lessons} Lessons</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">3.5 Hours</span>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Progress</span>
                <span className={module.completion === 100 ? 'text-emerald-500' : 'text-slate-900'}>{module.completion}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    module.completion === 100 ? 'bg-emerald-500' : `bg-${module.color}-500`
                  }`}
                  style={{ width: `${module.completion}%` }}
                />
              </div>
            </div>

            <button 
              onClick={() => navigate(`/modules/${module.id}`)}
              className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                module.completion === 0 
                ? `bg-slate-900 text-white hover:bg-slate-800`
                : `bg-${module.color}-50 text-${module.color}-600 hover:bg-${module.color}-100`
              }`}
            >
              {module.completion === 0 ? 'Start Learning' : 'Continue Module'}
              <ArrowRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Modules;
