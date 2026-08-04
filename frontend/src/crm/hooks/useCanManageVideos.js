import { useContext } from 'react';
import { useAuth } from '../context/AuthContext';

// Simple hook to determine if the current user can manage videos (admin or superadmin)
export const useCanManageVideos = () => {
  const { user } = useAuth();
  if (!user) return false;
  const role = user.role || user.role_name || '';
  return role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin';
};
