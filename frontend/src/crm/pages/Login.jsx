import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('--- LOGIN SUBMIT STARTED ---');
    console.log('Form Data Email:', formData.email);
    console.log('Password Exists:', !!formData.password);

    if (!formData.email || !formData.password) {
      console.log('Validation: FAILED (missing fields)');
      toast.error('Email and password are required');
      return;
    }

    console.log('Validation: PASSED');
    setLoading(true);
    
    try {
      console.log('Calling login function from context...');
      const result = await login(formData.email, formData.password);
      
      console.log('Login API Response received in Login.jsx:', result);

      if (result.success) {
        const userRole = result.user?.role;
        console.log('LOGIN SUCCESSFUL. User details:', result.user);
        console.log('USER ROLE RESOLVED:', userRole);
        toast.success('Welcome back!');

        // Resolve target redirect path based on user role
        let redirectPath = '/';
        if (userRole === 'superadmin') {
          redirectPath = '/superadmin/dashboard';
        } else if (userRole === 'admin') {
          redirectPath = '/';
        } else if (userRole === 'student') {
          redirectPath = '/student/dashboard';
        }

        console.log('DETERMINED REDIRECT PATH:', redirectPath);
        navigate(redirectPath);
      } else {
        console.log('LOGIN FAIL: Invalid credentials');
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.log('UNEXPECTED ERROR IN SUBMIT HANDLER:', error);
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
      console.log('--- LOGIN SUBMIT FINISHED ---');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 relative overflow-hidden bg-[#050A14]">
      
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-cyan-600/20 blur-[120px]" />
        <div className="absolute -top-20 right-0 w-[360px] h-[360px] rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-[440px]"
      >
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-3/4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent blur-[2px]" />

        <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl shadow-[0_32px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)] p-8 sm:p-10 overflow-hidden">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 p-[1px]">
              <div className="w-full h-full rounded-2xl bg-[#050A14] flex items-center justify-center">
                <ShieldCheck className="text-cyan-400" size={32} />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">GST Platform</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-200">
                  <Mail size={17} />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full h-[54px] pl-11 pr-4 rounded-2xl text-sm text-white placeholder:text-slate-600 bg-white/[0.05] border border-white/[0.08] outline-none transition-all duration-200 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between pl-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-200">
                  <Lock size={17} />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full h-[54px] pl-11 pr-12 rounded-2xl text-sm text-white placeholder:text-slate-600 bg-white/[0.05] border border-white/[0.08] outline-none transition-all duration-200 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-cyan-400 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[54px] rounded-2xl font-bold text-sm tracking-wide text-white
                bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500
                hover:shadow-[0_0_24px_rgba(34,197,94,0.3)]
                transition-all duration-300 active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Secure Login'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
