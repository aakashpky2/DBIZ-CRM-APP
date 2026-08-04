const supabase = require('../config/supabase');

// Middleware to restrict access based on user role
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const { data: dbUser, error } = await supabase.supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', req.user.id)
        .maybeSingle();

      if (error || !dbUser || !roles.includes(dbUser.role)) {
        console.log(`AUTH DENIED: User role '${dbUser?.role}' is not in allowed roles:`, roles);
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You do not have permission to access this resource'
        });
      }

      // Update role dynamically
      req.user.role = dbUser.role;
      next();
    } catch (err) {
      console.error('ROLE AUTHORIZE ERROR:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization verification'
      });
    }
  };
};
