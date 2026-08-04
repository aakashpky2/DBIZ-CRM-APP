const supabase = require('../config/supabase');

/**
 * Creates a single notification for a specific user.
 * @param {string} userId - UUID of the user.
 * @param {string} title - Title of the notification.
 * @param {string} message - Description message.
 * @param {string} type - Type (learning, account, institute, system).
 * @param {string} redirectUrl - URL to navigate to when clicked.
 */
exports.createNotification = async (userId, title, message, type, redirectUrl = null) => {
  try {
    const { error } = await supabase.supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title,
          message,
          type,
          redirect_url: redirectUrl,
          is_read: false
        }
      ]);

    if (error) {
      console.error('Failed to create notification for user:', userId, error.message);
    }
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};

/**
 * Creates notifications for all students.
 */
exports.notifyAllStudents = async (title, message, type, redirectUrl = null) => {
  try {
    const { data: students, error: fetchError } = await supabase.supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'student')
      .eq('status', 'active');

    if (fetchError || !students) {
      console.error('Failed to fetch students for bulk notification:', fetchError?.message);
      return;
    }

    const payload = students.map((s) => ({
      user_id: s.id,
      title,
      message,
      type,
      redirect_url: redirectUrl,
      is_read: false
    }));

    // Insert in batches if payload is too large, but for now we do a direct insert
    const { error: insertError } = await supabase.supabaseAdmin
      .from('notifications')
      .insert(payload);

    if (insertError) {
      console.error('Failed to bulk insert notifications:', insertError.message);
    }
  } catch (err) {
    console.error('Error in notifyAllStudents:', err);
  }
};
