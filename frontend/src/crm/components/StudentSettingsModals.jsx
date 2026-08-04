import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Check, AlertCircle, Camera, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export const SettingsModals = ({ activeModal, setActiveModal, user }) => {
  const { updateUserImage, updateUserProfileDetails } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.full_name || '',
    mobile: user?.mobile_number || '',
    institute: user?.institute || '',
    studentId: user?.student_id || ''
  });

  const [notifications, setNotifications] = useState({
    email: true, learning: true, credits: true, courses: true
  });

  const [appearance, setAppearance] = useState('System Default');
  const [language, setLanguage] = useState('English');
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profile_image || null);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!activeModal) return null;

  const handleClose = () => setActiveModal(null);

  const checkPasswordStrength = (pass) => {
    return {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass)
    };
  };

  const passStrength = checkPasswordStrength(passwordForm.new);
  const isPassValid = Object.values(passStrength).every(Boolean) && passwordForm.new === passwordForm.confirm && passwordForm.current;

  const handlePasswordUpdate = async () => {
    if (!isPassValid) return;
    setIsUpdating(true);

    try {
      // 1. Get the real email from Supabase using the stored token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session token not found.');
        setIsUpdating(false);
        return;
      }

      const { data: { user: supabaseUser }, error: getUserError } = await supabase.auth.getUser(token);
      
      if (getUserError || !supabaseUser?.email) {
        toast.error('Could not verify user identity.');
        setIsUpdating(false);
        return;
      }

      // 2. Verify current password by attempting to sign in with the real email
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: supabaseUser.email,
        password: passwordForm.current,
      });

      if (signInError) {
        toast.error('Current password is incorrect.');
        setIsUpdating(false);
        return;
      }

      // 3. Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.new,
      });

      if (updateError) {
        toast.error(updateError.message || 'Failed to update password.');
      } else {
        toast.success('Password updated successfully!');
        setPasswordForm({ current: '', new: '', confirm: '' });
        handleClose();
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image (JPG, PNG, WEBP).');
      return;
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2 MB.');
      return;
    }

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setSelectedFile(file);
  };

  const handleSaveChanges = async () => {
    setIsUploading(true);
    let hasChanges = false;
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const BACKEND_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL.replace(/\/$/, '')}/api`;

    try {
      // 1. Save profile details
      const currentName = user?.full_name || '';
      const currentMobile = user?.mobile_number || '';
      const currentInstitute = user?.institute || '';

      if (profileForm.name !== currentName || profileForm.mobile !== currentMobile || profileForm.institute !== currentInstitute) {
        const { data: profileData } = await axios.put(`${BACKEND_URL}/auth/profile`, 
          { 
            full_name: profileForm.name, 
            mobile_number: profileForm.mobile, 
            institute: profileForm.institute 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (profileData.success) {
          updateUserProfileDetails(profileData.user);
          hasChanges = true;
        } else {
          throw new Error('Failed to update profile details');
        }
      }

      // 2. Upload and save profile image if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://amrpdbwgvpjmrhkncthr.supabase.co';
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const res = await fetch(`${supabaseUrl}/storage/v1/object/avatars/${filePath}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': supabaseAnonKey,
            'Content-Type': selectedFile.type,
          },
          body: selectedFile
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Storage upload failed');
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;
        
        const { data: imageData } = await axios.put(`${BACKEND_URL}/auth/profile-image`, 
          { profile_image: publicUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (imageData.success) {
          updateUserImage(publicUrl);
          setSelectedFile(null);
          hasChanges = true;
        } else {
          throw new Error('Failed to update DB image URL');
        }
      }

      if (hasChanges) {
        toast.success('Profile updated successfully!');
      }
      handleClose();

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Update failed. Please try again.');
      setImagePreview(user?.profile_image || null); // Revert image preview if it failed
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user?.profile_image) return;
    setIsUploading(true);

    try {
      // Extract file path from URL
      const urlParts = user.profile_image.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `public/${fileName}`;

      const token = localStorage.getItem('token');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://amrpdbwgvpjmrhkncthr.supabase.co';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/storage/v1/object/avatars/${filePath}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseAnonKey
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Storage remove failed');
      }

      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const BACKEND_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL.replace(/\/$/, '')}/api`;
      
      const { data } = await axios.put(`${BACKEND_URL}/auth/profile-image`, 
        { profile_image: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        updateUserImage(null);
        setImagePreview(null);
        setSelectedFile(null);
        toast.success('Profile picture removed.');
      } else {
        throw new Error('Failed to remove from DB');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderContent = () => {
    switch (activeModal) {
      case 'profile':
        const userName = user?.full_name || user?.email?.split('@')[0] || 'User';
        return (
          <div className="space-y-4">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center justify-center mb-6 pb-6 border-b border-slate-100">
              <div className="relative group">
                <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-4xl font-bold text-slate-400 border-4 border-white shadow-md relative">
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                      <Loader2 className="animate-spin text-cyan-600" size={32} />
                    </div>
                  )}
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(userName)
                  )}
                </div>
                
                <label className="absolute bottom-0 right-0 p-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full cursor-pointer shadow-lg transition-colors border-2 border-white">
                  <Camera size={18} />
                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} disabled={isUploading} />
                </label>
              </div>
              
              <div className="flex gap-3 mt-4">
                <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg cursor-pointer transition-colors">
                  Upload Photo
                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} disabled={isUploading} />
                </label>
                {imagePreview && (
                  <button onClick={handleRemoveImage} disabled={isUploading} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                    <Trash2 size={16} /> Remove
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email (Read Only)</label>
              <input type="email" value={user?.email || ''} disabled className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
              <input type="tel" value={profileForm.mobile} onChange={(e) => setProfileForm({...profileForm, mobile: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Institute</label>
              <input type="text" value={profileForm.institute} onChange={(e) => setProfileForm({...profileForm, institute: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleClose} disabled={isUploading} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50">Cancel</button>
              <button onClick={handleSaveChanges} disabled={isUploading} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {isUploading ? <Loader2 className="animate-spin" size={16} /> : null} Save Changes
              </button>
            </div>
          </div>
        );
      
      case 'password':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={passwordForm.new} onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10 text-slate-900" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="text-xs space-y-1">
              <p className={passStrength.length ? "text-emerald-500 flex gap-1 items-center" : "text-slate-400 flex gap-1 items-center"}>{passStrength.length ? <Check size={12}/> : <span className="w-3"/>} Minimum 8 characters</p>
              <p className={passStrength.upper ? "text-emerald-500 flex gap-1 items-center" : "text-slate-400 flex gap-1 items-center"}>{passStrength.upper ? <Check size={12}/> : <span className="w-3"/>} One uppercase letter</p>
              <p className={passStrength.lower ? "text-emerald-500 flex gap-1 items-center" : "text-slate-400 flex gap-1 items-center"}>{passStrength.lower ? <Check size={12}/> : <span className="w-3"/>} One lowercase letter</p>
              <p className={passStrength.number ? "text-emerald-500 flex gap-1 items-center" : "text-slate-400 flex gap-1 items-center"}>{passStrength.number ? <Check size={12}/> : <span className="w-3"/>} One number</p>
              <p className={passStrength.special ? "text-emerald-500 flex gap-1 items-center" : "text-slate-400 flex gap-1 items-center"}>{passStrength.special ? <Check size={12}/> : <span className="w-3"/>} One special character</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900" />
              {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && <p className="text-red-500 text-xs mt-1">Passwords do not match</p>}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleClose} disabled={isUpdating} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50">Cancel</button>
              <button disabled={!isPassValid || isUpdating} onClick={handlePasswordUpdate} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {isUpdating ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        );

      case 'notifications':
        const Toggle = ({ label, field }) => (
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <button onClick={() => setNotifications({...notifications, [field]: !notifications[field]})} className={`w-11 h-6 rounded-full transition-colors relative ${notifications[field] ? 'bg-cyan-500' : 'bg-slate-200'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications[field] ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        );
        return (
          <div className="space-y-2">
            <Toggle label="Email Notifications" field="email" />
            <Toggle label="Learning Reminders" field="learning" />
            <Toggle label="Credit Alerts" field="credits" />
            <Toggle label="Course Updates" field="courses" />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={() => { toast.success('Preferences saved!'); handleClose(); }} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700">Save</button>
            </div>
          </div>
        );

      case 'appearance':
        const options = ['Light Mode', 'Dark Mode', 'System Default'];
        return (
          <div className="space-y-3">
            {options.map(opt => (
              <label key={opt} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="radio" name="theme" checked={appearance === opt} onChange={() => setAppearance(opt)} className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-medium text-slate-700">{opt}</span>
              </label>
            ))}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={() => { toast.success('Theme updated!'); handleClose(); }} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700">Save</button>
            </div>
          </div>
        );

      case 'language':
        const langs = ['English', 'Hindi', 'Malayalam', 'Tamil', 'Kannada'];
        return (
          <div className="space-y-3">
            {langs.map(l => (
              <label key={l} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="radio" name="lang" checked={language === l} onChange={() => setLanguage(l)} className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-medium text-slate-700">{l}</span>
              </label>
            ))}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={() => { toast.success('Language changed!'); handleClose(); }} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700">Save</button>
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Credits Remaining</p>
              <p className="text-2xl font-black text-cyan-600">42</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Credits Used</p>
              <p className="text-2xl font-black text-emerald-600">8</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Watch Time</p>
              <p className="text-2xl font-black text-slate-800">12h 45m</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Videos</p>
              <p className="text-2xl font-black text-slate-800">14</p>
            </div>
            <div className="col-span-2 mt-4">
              <button onClick={handleClose} className="w-full px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">Close</button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-800 mb-1">Current Session</p>
              <p className="text-xs text-slate-500 mb-3">Last login: Today, 10:45 AM<br/>Device: Windows • Chrome</p>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active Now
              </div>
            </div>
            <button onClick={() => { toast.success('Logged out of all other devices.'); handleClose(); }} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors">
              <AlertCircle size={16} /> Logout Other Devices
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm mb-6">Information for {activeModal.replace('-', ' ')} goes here.</p>
            <button onClick={handleClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Close</button>
          </div>
        );
    }
  };

  const getTitle = () => {
    const titles = {
      profile: 'My Profile',
      password: 'Change Password',
      notifications: 'Notification Settings',
      appearance: 'Appearance',
      language: 'Language',
      stats: 'Learning Statistics',
      security: 'Privacy & Security',
      help: 'Help & Support',
      terms: 'Terms & Privacy'
    };
    return titles[activeModal] || activeModal;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">{getTitle()}</h3>
          <button onClick={handleClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </motion.div>
    </div>
  );
};
