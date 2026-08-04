const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

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

        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, username')
            .eq('id', decoded.id)
            .single();

        let foundUser = user;

        if (error || !foundUser) {
            // Check local fallback
            const fs = require('fs');
            const path = require('path');
            const LOCAL_DB_PATH = path.join(__dirname, '../local_db.json');
            let localUser = null;
            try {
                if (fs.existsSync(LOCAL_DB_PATH)) {
                    const localDb = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8') || '{}');
                    if (localDb.temp_users && Array.isArray(localDb.temp_users)) {
                        localUser = localDb.temp_users.find(u => u.username === decoded.id || u.id === decoded.id);
                    }
                }
            } catch(e) { }

            if (localUser) {
                foundUser = localUser;
            } else {
                return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
            }
        }

        req.user = foundUser;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};
