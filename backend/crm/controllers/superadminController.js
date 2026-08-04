const supabase = require('../config/supabase');

// @desc    Super Admin Login
// @route   POST /api/superadmin/login
exports.superadminLogin = async (req, res, next) => {
  const { username, password } = req.body;

  console.log('================ SUPER ADMIN LOGIN API HIT ================');
  console.log('USERNAME RECEIVED:', username);
  console.log('PASSWORD EXISTS:', !!password);

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  try {
    // 1. Authenticate using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: username,
      password
    });

    if (authError) {
      console.log('SUPER ADMIN AUTH ERROR:', authError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const { user, session } = authData;

    // 2. Fetch profile from public.users to strictly validate role and status
    const { data: dbUser, error: dbError } = await supabase.supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (dbError) {
      console.error('SUPABASE DB ERROR querying superadmin profile:', dbError.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authentication'
      });
    }

    if (!dbUser || dbUser.role !== 'superadmin') {
      console.log(`SUPER ADMIN LOGIN FAILED: Profile mismatch for user ID '${user.id}'`);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    if (dbUser.status !== 'active') {
      console.log(`SUPER ADMIN LOGIN FAILED: Super Admin account status is '${dbUser.status}'`);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    console.log('SUPER ADMIN AUTHENTICATION SUCCESS');
    console.log('================ SUPER ADMIN LOGIN API SUCCESS ================');

    res.status(200).json({
      success: true,
      token: session.access_token,
      user: {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role,
        status: dbUser.status
      }
    });

  } catch (error) {
    console.error('SUPER ADMIN LOGIN ERROR:', error);
    next(error);
  }
};
