import React, { createContext, useContext, useState, useCallback } from 'react';

/* ─── Shared Role Context ─── */
const RolesContext = createContext(null);

const generateId = () => `role_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const INITIAL_ROLES = [
  {
    id: 'role_students',
    name: 'Students',
    description: 'Student access to learning modules, assigned tasks, and personal profile.',
    permissions: ['Learning Service'],
    priority: 1,
    status: 'Active',
    color: 'from-purple-500 to-indigo-600',
    usersCount: 0,
  },
];

export const RolesProvider = ({ children }) => {
  const [roles, setRoles] = useState(INITIAL_ROLES);

  // Create a new role
  const createRole = useCallback(({ name, description, permissions, priority, status }) => {
    const newRole = {
      id: generateId(),
      name: name.trim(),
      description: description?.trim() || 'No description provided.',
      permissions: permissions?.length > 0 ? permissions : ['Access Modules'],
      priority: Number(priority) || 99,
      status: status || 'Active',
      color: 'from-purple-500 to-indigo-600',
      usersCount: 0,
    };
    setRoles(prev => [...prev, newRole]);
    return newRole;
  }, []);

  // Delete role — blocked if users assigned
  const deleteRole = useCallback((id) => {
    const role = roles.find(r => r.id === id);
    if (!role) return { success: false, message: 'Role not found.' };
    if (role.usersCount > 0) {
      return {
        success: false,
        message: `Cannot delete "${role.name}": ${role.usersCount} user(s) are assigned to this role. Reassign them first.`,
      };
    }
    setRoles(prev => prev.filter(r => r.id !== id));
    return { success: true };
  }, [roles]);

  // Update role permissions / status / name
  const updateRole = useCallback((id, updates) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  // Called by UserManagement when a user is assigned/unassigned a role
  const incrementRoleUserCount = useCallback((roleId) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, usersCount: r.usersCount + 1 } : r));
  }, []);

  const decrementRoleUserCount = useCallback((roleId) => {
    setRoles(prev => prev.map(r =>
      r.id === roleId ? { ...r, usersCount: Math.max(0, r.usersCount - 1) } : r
    ));
  }, []);

  // Only active roles — for UserManagement dropdown
  const activeRoles = roles.filter(r => r.status === 'Active');

  return (
    <RolesContext.Provider value={{
      roles,
      activeRoles,
      createRole,
      deleteRole,
      updateRole,
      incrementRoleUserCount,
      decrementRoleUserCount,
    }}>
      {children}
    </RolesContext.Provider>
  );
};

export const useRoles = () => {
  const ctx = useContext(RolesContext);
  if (!ctx) throw new Error('useRoles must be used inside RolesProvider');
  return ctx;
};
