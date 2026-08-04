const supabase = require('../config/supabase');

exports.protect = async (req, res, next) => {
  let token;

  console.log('---------------- PROTECT MIDDLEWARE HIT ----------------');

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log('TOKEN MISSING: Unauthorized');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Validate token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.warn('SUPABASE JWT VERIFICATION FAILED:', error?.message || 'No user returned');
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: error?.message || 'Token verification failed'
      });
    }

    // Fetch profile details from public.users to attach role/permissions
    const { data: dbUser, error: dbError } = await supabase.supabaseAdmin
      .from('users')
      .select('id, username, role, status, permissions')
      .eq('id', user.id)
      .maybeSingle();

    if (dbError || !dbUser) {
      console.log('USER PROFILE NOT FOUND FOR AUTH ID:', user.id);
      return res.status(401).json({
        success: false,
        message: 'User profile is not configured. Please contact admin.',
      });
    }

    if (dbUser.status !== 'active') {
      console.log('USER ACCOUNT INACTIVE FOR AUTH ID:', user.id);
      return res.status(401).json({
        success: false,
        message: 'Your account is inactive. Please contact admin.',
      });
    }

    let permissions = dbUser.permissions;
    if (!permissions || Object.keys(permissions).length === 0) {
      if (dbUser.role === 'admin' || dbUser.role === 'superadmin') {
        permissions = { admin_panel: true, learning_service: true, hierarchy_management: true, modules: { gst: true, income_tax: true, roc: true, trademark: true, accounting: true, payroll: true, audit: true, company_registration: true } };
      } else if (dbUser.role === 'student' || dbUser.role === 'manager' || dbUser.role === 'institute' || dbUser.role === 'channel') {
        const isManagerOrAbove = dbUser.role !== 'student';
        permissions = { admin_panel: false, learning_service: true, hierarchy_management: isManagerOrAbove, modules: { gst: true, income_tax: false, roc: false, trademark: false, accounting: false, payroll: false, audit: false, company_registration: false } };
      } else {
        permissions = { admin_panel: false, learning_service: false, hierarchy_management: false, modules: {} };
      }
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.username,
      username: dbUser.username,
      role: dbUser.role,
      status: dbUser.status,
      permissions
    };

    next();
  } catch (error) {
    console.error('UNEXPECTED PROTECT ERROR:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message
    });
  }
};
