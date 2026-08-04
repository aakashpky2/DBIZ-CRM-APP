import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RolesProvider } from './context/RolesContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import SystemRole from './pages/SystemRole';
import UserManagement from './pages/UserManagement';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LearningPage from './pages/LearningPage';
import GSTVideoPlayer from './pages/GSTVideoPlayer';
import WatchSessionsMonitoring from './pages/WatchSessionsMonitoring';
import Notifications from './pages/Notifications';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050A14]">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Super Admin Protected Route Component
const SuperAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#060B18]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  // If no user is logged in, redirect to the existing login page
  if (!user) {
    console.log('SuperAdminRoute: No user logged in. Redirecting to /login');
    return <Navigate to="/login" replace />;
  }
  
  // If logged-in user is not superadmin, redirect them to their correct dashboard
  if (user.role !== 'superadmin') {
    console.log(`SuperAdminRoute: User role '${user.role}' is not superadmin. Redirecting to appropriate dashboard.`);
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }
  
  return children;
};

// Admin Panel Protected Route Component
const AdminPanelRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const hasAdminPanel = 
    user.role === 'superadmin' || 
    user.role === 'admin' || 
    user.permissions?.admin_panel === true ||
    user.permissions === undefined;

  if (!hasAdminPanel) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-10 max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500 text-sm">You do not have permission to access the Admin Panel. Contact your administrator for access.</p>
      </div>
    );
  }
  
  return children;
};

// Learning Service Protected Route Component
const LearningServiceRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const hasLearningService = 
    user.role === 'superadmin' || 
    user.role === 'admin' || 
    user.permissions?.learning_service === true;

  if (!hasLearningService) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-10 max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500 text-sm">You do not have permission to access the Learning Service. Contact your administrator for access.</p>
      </div>
    );
  }
  
  return children;
};

// Hierarchy Management Protected Route Component
const HierarchyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const hasHierarchy = user.permissions?.hierarchy_management === true;

  if (!hasHierarchy) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-10 max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500 text-sm">You do not have permission to manage teams.</p>
      </div>
    );
  }
  
  return children;
};

function App() {
  return (
    <RolesProvider>
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Super Admin Routes */}
          <Route path="/superadmin/dashboard" element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <AdminPanelRoute>
              <AdminDashboard />
            </AdminPanelRoute>
          } />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="student/dashboard" element={<Dashboard />} />
            <Route path="modules" element={<LearningServiceRoute><Modules /></LearningServiceRoute>} />
            <Route path="modules/:id" element={<LearningServiceRoute><ModuleDetail /></LearningServiceRoute>} />
            <Route path="learning/:service" element={<LearningServiceRoute><LearningPage /></LearningServiceRoute>} />
            <Route path="learning/:service/video/:videoId" element={<LearningServiceRoute><GSTVideoPlayer /></LearningServiceRoute>} />
            <Route path="compliance" element={<LearningServiceRoute><div className="p-8"><h1 className="text-2xl font-bold">Compliance Updates</h1><p className="text-slate-500 mt-2">Feature coming soon...</p></div></LearningServiceRoute>} />
            <Route path="resources" element={<LearningServiceRoute><div className="p-8"><h1 className="text-2xl font-bold">Resources</h1><p className="text-slate-500 mt-2">Feature coming soon...</p></div></LearningServiceRoute>} />
            <Route path="settings" element={<Settings />} />
            <Route path="projects" element={<Projects />} />
            <Route path="system-role" element={<AdminPanelRoute><SystemRole /></AdminPanelRoute>} />
            <Route path="user-management" element={<AdminPanelRoute><UserManagement /></AdminPanelRoute>} />
            <Route path="watch-monitoring" element={<AdminPanelRoute><WatchSessionsMonitoring /></AdminPanelRoute>} />
            <Route path="team-management" element={<HierarchyRoute><UserManagement /></HierarchyRoute>} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
    </RolesProvider>
  );
}

export default App;
