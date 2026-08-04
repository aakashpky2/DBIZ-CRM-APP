import React, { useEffect, useState } from 'react';
import { itemService } from '../services/api';
import { supabase } from '../supabase';
import { 
  Plus, Search, Edit2, Trash2, AlertCircle, Loader2, X, FolderKanban, Info, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const STATUS_THEME = {
  active:    { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
  completed: { badge: 'bg-blue-50 text-blue-700 border-blue-100', icon: <FolderKanban size={14} className="text-blue-500" /> },
  pending:   { badge: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock size={14} className="text-amber-500" /> },
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'pending' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProjects(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setProjects(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        } else if (payload.eventType === 'DELETE') {
          setProjects(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await itemService.getAll();
      setProjects(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Project Name is required');
      return;
    }
    setSubmitting(true);
    try {
      if (currentProject) {
        await itemService.update(currentProject.id, formData);
        toast.success('Project updated successfully');
      } else {
        await itemService.create(formData);
        toast.success('Project created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchProjects(); // reload fresh state
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await itemService.delete(id);
        toast.success('Project deleted');
        fetchProjects(); // reload fresh state
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', status: 'pending' });
    setCurrentProject(null);
  };

  const openEditModal = (project) => {
    setCurrentProject(project);
    setFormData({ 
      name: project.name, 
      description: project.description || '', 
      status: project.status 
    });
    setIsModalOpen(true);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-slate-500 font-medium">Manage and track your project progress</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 hover:opacity-95 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search projects..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 shadow-sm transition-all"
        />
      </div>

      {/* Grid of Projects */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-cyan-500" size={40} />
          <span className="text-sm font-semibold text-slate-400">Loading projects...</span>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => {
            const theme = STATUS_THEME[project.status] || STATUS_THEME.pending;
            return (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col justify-between group hover:shadow-lg hover:border-cyan-500/10 transition-all duration-300 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${theme.badge}`}>
                      {theme.icon}
                      <span className="capitalize">{project.status}</span>
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(project)}
                        className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{project.name}</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-3">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-t border-slate-50 pt-4 mt-auto">
                  <span>Created {new Date(project.created_at || new Date()).toLocaleDateString()}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No projects found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs leading-relaxed">
            Create a new project or adjust your query to get started.
          </p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100/50 z-10 overflow-hidden flex flex-col"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95 z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                <div className="flex gap-4 items-start mb-6 pr-8">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                    <FolderKanban size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {currentProject ? 'Edit Project' : 'Create New Project'}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      Provide project metadata and specify its pipeline status.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Name *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Website Redesign"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                    <textarea 
                      rows={4}
                      placeholder="Describe the project goals and objectives..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                    <div className="relative">
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                      <X size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none hidden" />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 active:scale-95 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={submitting}
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-md shadow-cyan-500/10 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 className="animate-spin" size={16} />}
                      {currentProject ? 'Save Changes' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
