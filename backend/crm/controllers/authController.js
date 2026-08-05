const { supabase, supabaseAdmin } = require('../../config/supabase');
const { createNotification } = require('../utils/notificationService');

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  console.log('================ LOGIN API HIT ================');
  console.log('[CRM AUTH] Login attempt', { email });

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email/Username and password are required'
    });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('invalid')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      } else {
        console.error('SUPABASE AUTH UNEXPECTED ERROR:', authError);
        return res.status(500).json({
          success: false,
          message: 'Authentication service error'
        });
      }
    }

    const { user, session } = authData;

    console.log('[CRM AUTH] Password verification', {
      email,
      passwordMatched: true,
      passwordStorageType: 'supabase-auth'
    });

    console.log('[CRM AUTH] Auth succeeded', {
      authUserId: user.id,
      email: user.email,
    });

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    console.log('[CRM AUTH] Profile query result', {
      authUserId: user.id,
      profileFound: Boolean(profile),
      errorCode: profileError?.code || null,
      errorMessage: profileError?.message || null,
      errorDetails: profileError?.details || null,
      errorHint: profileError?.hint || null,
    });

    if (profileError) {
      return res.status(500).json({
        success: false,
        message: 'CRM profile query failed',
      });
    }

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: 'CRM profile not found',
      });
    }

    const dbUser = profile;

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
    
    const { data, error } = await supabaseAdmin
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
    
    const { data, error } = await supabaseAdmin
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