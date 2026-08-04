const supabaseAdmin = require('../config/supabaseAdmin');
const { createNotification } = require('../utils/notificationService');

exports.getUsers = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    let query = supabaseAdmin.from('users').select('*').order('created_at', { ascending: false });

    // Hierarchy filter
    if (userRole !== 'superadmin' && userRole !== 'admin') {
      // Channel, Institute, Manager only see their direct children
      query = query.eq('parent_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, users: data });
  } catch (err) {
    console.error('GET users error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, username, role, permissions, status } = req.body;
    const creatorRole = req.user.role;
    const creatorId = req.user.id;

    // Validate hierarchy rules
    if (creatorRole === 'channel' && role !== 'institute') {
      return res.status(403).json({ success: false, message: 'Channels can only create Institutes.' });
    }
    if (creatorRole === 'institute' && role !== 'manager') {
      return res.status(403).json({ success: false, message: 'Institutes can only create Managers.' });
    }
    if (creatorRole === 'manager' && role !== 'student') {
      return res.status(403).json({ success: false, message: 'Managers can only create Students.' });
    }
    if (creatorRole === 'student') {
      return res.status(403).json({ success: false, message: 'Students cannot create users.' });
    }

    // 1. Create User in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, role }
    });

    if (authError) throw authError;

    // 2. Insert into public.users
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        username,
        role,
        permissions,
        status: status || 'active',
        parent_id: (creatorRole !== 'superadmin' && creatorRole !== 'admin') ? creatorId : null
      })
      .select()
      .single();

    if (dbError) {
      // Rollback Auth user if DB insert fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw dbError;
    }

    // 3. If student, create wallet
    if (role === 'student') {
      await supabaseAdmin.from('student_credits').insert({
        student_id: authUser.user.id,
        used_credits: 0,
        remaining_credits: 0
      });
    }

    // Trigger notification to the new user
    await createNotification(
      authUser.user.id,
      'Welcome to DBiz CRM',
      `Your ${role} account has been successfully created.`,
      'system',
      '/'
    );

    res.status(201).json({ success: true, user: dbUser });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    // 1. Fetch user to check ownership
    const { data: targetUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('parent_id')
      .eq('id', id)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Super Admin/Admin can delete anyone. Others can only delete their children.
    if (userRole !== 'superadmin' && userRole !== 'admin') {
      if (targetUser.parent_id !== userId) {
        return res.status(403).json({ success: false, message: 'Access denied to delete this user' });
      }
    }

    // Delete from Supabase Auth (this cascades to public.users because of DB triggers, if set, otherwise delete manually)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authDeleteError) throw authDeleteError;

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
