const supabase = require('../config/supabase');

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { data, error } = await supabase.supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }

    return res.status(200).json({
      success: true,
      notifications: data
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase.supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
    }

    return res.status(200).json({ success: true, notification: data });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    const { data, error } = await supabase.supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false)
      .select();

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to mark all as read' });
    }

    return res.status(200).json({ success: true, updated: data.length });
  } catch (err) {
    next(err);
  }
};
