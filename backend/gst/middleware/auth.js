const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../../config/supabase');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.GST_JWT_SECRET);

    if (decoded.app !== 'gst') {
      return res.status(401).json({
        success: false,
        message: 'Invalid GST token',
      });
    }

    const { data: user, error } = await supabaseAdmin
      .from('gst_users')
      .select('id, username, email, role, status')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error || !user || user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};
