const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../../config/supabase');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const normalizedUsername = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');

    if (!normalizedUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    console.log('[GST AUTH] Login attempt', {
      username: normalizedUsername,
      hasPassword: Boolean(password),
    });

    const { data: user, error } = await supabaseAdmin
      .from('gst_users')
      .select('id, username, email, password_hash, role, status, trn')
      .eq('username', normalizedUsername)
      .maybeSingle();

    console.log('[GST AUTH] User lookup', {
      userFound: Boolean(user),
      userId: user?.id || null,
      status: user?.status || null,
      hasPasswordHash: Boolean(user?.password_hash),
      errorCode: error?.code || null,
    });

    if (error) {
      console.error('[GST AUTH] User lookup failed', {
        code: error.code || null,
        message: error.message || null,
        details: error.details || null,
        hint: error.hint || null,
      });

      return res.status(500).json({
        success: false,
        message: 'GST login lookup failed',
      });
    }

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const validHash = typeof user.password_hash === 'string' && /^\$2[aby]\$/.test(user.password_hash);

    if (!validHash) {
      console.error('[GST AUTH] Invalid password hash', {
        userId: user.id,
        username: user.username,
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const passwordMatched = await bcrypt.compare(password, user.password_hash);

    console.log('[GST AUTH] Password verification', {
      userId: user.id,
      passwordMatched,
    });

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!process.env.GST_JWT_SECRET) {
      console.error('[GST AUTH] GST_JWT_SECRET is not configured');
      return res.status(500).json({
        success: false,
        message: 'GST authentication is not configured',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        app: 'gst',
      },
      process.env.GST_JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || '7d',
      }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        trn: user.trn,
      },
    });
  } catch (error) {
    console.error('[GST AUTH] Login failed', {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('gst_users')
      .select('id, username, email, role, status, trn')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old and new passwords are required' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('gst_users')
      .select('id, username, password_hash, status')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ success: false, message: 'Database error' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const passwordMatched = await bcrypt.compare(oldPassword, user.password_hash);
    if (!passwordMatched) {
      return res.status(401).json({ success: false, message: 'Incorrect old password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    const { error: updateErr } = await supabaseAdmin
      .from('gst_users')
      .update({ password_hash: passwordHash })
      .eq('id', user.id);

    if (updateErr) return res.status(500).json({ success: false, message: 'Failed to update password' });

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

// @desc    Check if username exists
// @route   POST /api/auth/check-username
// @access  Public
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username required' });
    }
    
    const { data: user, error } = await supabaseAdmin
      .from('gst_users')
      .select('id, username, status')
      .eq('username', username)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (user) {
      return res.status(200).json({ success: true, message: 'User found' });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

// @desc    Generate OTP for forgot password
// @route   POST /api/auth/generate-forgot-otp
// @access  Public
exports.generateForgotOtp = async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username && !email) {
      return res.status(400).json({ success: false, message: 'Username or email required' });
    }

    let query = supabaseAdmin.from('gst_users').select('id, username');
    if (username) {
        query = query.eq('username', username);
    } else {
        query = query.eq('email', email);
    }
    
    const { data: user, error: userErr } = await query.maybeSingle();
    
    if (userErr || !user) {
      return res.status(404).json({ success: false, message: 'Invalid details. User not found.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    await supabaseAdmin.from('forgot_otps').upsert({ username: user.username, otp, expires_at: expiresAt });
    
    return res.status(200).json({ success: true, otp, message: 'OTP generated' });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

// @desc    Verify OTP for forgot password
// @route   POST /api/auth/verify-forgot-otp
// @access  Public
exports.verifyForgotOtp = async (req, res) => {
  try {
    const { username, otp } = req.body;
    if (!username || !otp) {
      return res.status(400).json({ success: false, message: 'Username and OTP required' });
    }
    const { data: record, error } = await supabaseAdmin
      .from('forgot_otps')
      .select('otp, expires_at')
      .eq('username', username)
      .maybeSingle();

    if (error || !record) {
      return res.status(404).json({ success: false, message: 'OTP not found. Generate again.' });
    }
    if (record.otp !== String(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please generate again.' });
    }
    return res.status(200).json({ success: true, message: 'OTP verified' });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.status(400).json({ success: false, message: 'Username and new password required' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const { error: updateErr } = await supabaseAdmin
      .from('gst_users')
      .update({ password_hash: passwordHash })
      .eq('username', username);

    if (updateErr) {
      return res.status(500).json({ success: false, message: 'Failed to update password' });
    }
    await supabaseAdmin.from('forgot_otps').delete().eq('username', username);
    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

// @desc    Get User Profile details
// @route   POST /api/auth/profile
// @access  Public
exports.getProfile = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error || !profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile not found' 
      });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

// @desc    Forgot password (Legacy/Current fallback)
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  return res.status(400).json({ 
    success: false, 
    message: 'Forgot password requires email or username. PAN lookup is no longer supported.' 
  });
};
