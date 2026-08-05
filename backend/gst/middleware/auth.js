const jwt = require('jsonwebtoken');
const { supabase, supabaseAdmin } = require('../../config/supabase');

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
        // Verify token
        const decoded = jwt.verify(token, process.env.GST_JWT_SECRET || process.env.JWT_SECRET);

        // Handle Simulation Mode user
        if (decoded.id === 'demo-id-123') {
            req.user = { id: 'demo-id-123', username: 'Simulation User', isSimulated: true };
            return next();
        }

        const { data: user, error } = await supabaseAdmin
            .from('gst_users')
            .select('id, email, username, role, status')
            .eq('id', decoded.id)
            .maybeSingle();

        if (error || !user) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }

        if (user.status !== 'active') {
            return res.status(401).json({ success: false, message: 'Account is inactive' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};
