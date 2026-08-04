const supabase = require('../config/supabase');
const { createNotification } = require('../utils/notificationService');

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  console.log('================ LOGIN API HIT ================');
  console.log('EMAIL/USERNAME RECEIVED:', email);
  console.log('PASSWORD EXISTS:', !!password);

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email/Username and password are required'
    });
  }

  try {
    console.log('AUTHENTICATING WITH SUPABASE AUTH...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.log('SUPABASE AUTH ERROR:', authError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const { user, session } = authData;
    console.log('SUPABASE AUTH SUCCESS! User ID:', user.id);

    // Fetch user profile from public.users table using the auth user's ID
    const { data: dbUser, error: dbError } = await supabase.supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    console.log('DB PROFILE RETRIEVAL:', dbUser);
    if (dbError) {
      console.error('SUPABASE DB ERROR:', dbError.message);
    }

    if (dbError || !dbUser) {
      console.log('LOGIN BLOCKED: User profile not configured for ID:', user.id);
      return res.status(401).json({
        success: false,
        message: 'User profile is not configured. Please contact admin.'
      });
    }

    console.log("USER ROLE:", dbUser.role);
    const allowedRoles = ['superadmin', 'admin', 'channel', 'institute', 'manager', 'student'];
    if (!allowedRoles.includes(dbUser.role)) {
      console.log('LOGIN BLOCKED: Role not allowed:', dbUser.role);
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Role not permitted to login.'
      });
    }

    console.log("USER STATUS:", dbUser.status);
    if (dbUser.status !== 'active') {
      console.log('LOGIN BLOCKED: User account status is inactive:', dbUser.status);
      return res.status(401).json({
        success: false,
        message: 'Your account is inactive. Please contact admin.'
      });
    }

    let permissions = dbUser.permissions;
    if (!permissions || Object.keys(permissions).length === 0) {
      if (dbUser.role === 'admin' || dbUser.role === 'superadmin') {
        permissions = { admin_panel: true, learning_service: true, hierarchy_management: true, modules: { gst: true, income_tax: true, roc: true, trademark: true, accounting: true, payroll: true, audit: true, company_registration: true } };
      } else if (
        dbUser.role === 'student' ||
        dbUser.role === 'manager' ||
        dbUser.role === 'institute' ||
        dbUser.role === 'channel'
      ) {
        const isManagerOrAbove = dbUser.role !== 'student';
        permissions = { admin_panel: false, learning_service: true, hierarchy_management: isManagerOrAbove, modules: { gst: true, income_tax: false, roc: false, trademark: false, accounting: false, payroll: false, audit: false, company_registration: false } };
      } else {
        permissions = { admin_panel: false, learning_service: false, hierarchy_management: false, modules: {} };
      }
    }

    console.log(`LOGIN SUCCESS: ${dbUser.username} as ${dbUser.role}`);

    return res.status(200).json({
      success: true,
      token: session.access_token,
      user: {
        id: dbUser.id,
        email: dbUser.username,
        username: dbUser.username,
        role: dbUser.role,
        status: dbUser.status,
        profile_image: dbUser.profile_image,
        full_name: dbUser.full_name,
        mobile_number: dbUser.mobile_number,
        institute: dbUser.institute,
        student_id: dbUser.student_id,
        permissions
      }
    });

  } catch (error) {
    console.error('UNEXPECTED LOGIN ERROR:', error);
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile image
// @route   PUT /api/auth/profile-image
exports.updateProfileImage = async (req, res, next) => {
  try {
    const { profile_image } = req.body;
    
    const { data, error } = await supabase.supabaseAdmin
      .from('users')
      .update({ profile_image })
      .eq('id', req.user.id)
      .select('profile_image')
      .single();

    if (error) {
      console.error('Error updating profile image:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to update profile image' });
    }

    // Trigger notification
    await createNotification(
      req.user.id,
      'Profile Picture Updated',
      'Your profile picture was successfully updated.',
      'account',
      '/settings'
    );

    return res.status(200).json({
      success: true,
      profile_image: data.profile_image
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile details
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { full_name, mobile_number, institute } = req.body;
    
    const { data, error } = await supabase.supabaseAdmin
      .from('users')
      .update({ full_name, mobile_number, institute })
      .eq('id', req.user.id)
      .select('full_name, mobile_number, institute')
      .single();

    if (error) {
      console.error('Error updating profile:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }

    // Trigger notification
    await createNotification(
      req.user.id,
      'Profile Details Updated',
      'Your personal details have been updated successfully.',
      'account',
      '/settings'
    );

    return res.status(200).json({
      success: true,
      user: data
    });
  } catch (error) {
    next(error);
  }
};