const supabase = require('../config/supabase');
const { createNotification } = require('../utils/notificationService');

// Constants for credit burning
// Using 1 credit = 1 minute watched (60 seconds) as default, can be configured later
const SECONDS_PER_CREDIT = 60; 

// @desc    Start a video watch session
// @route   POST /api/video/start
exports.startVideoSession = async (req, res) => {
  const studentId = req.user.id;
  const { video_id } = req.body;

  if (!video_id) {
    return res.status(400).json({ success: false, message: 'video_id is required' });
  }

  try {
    // 1. Check if user is enabled for learning and has credits
    const { data: userProfile, error: userError } = await supabase.supabaseAdmin
      .from('users')
      .select('learning_service_enabled')
      .eq('id', studentId)
      .maybeSingle();
      
    if (userError) throw userError;
    if (!userProfile || userProfile.learning_service_enabled === false) {
      return res.status(403).json({ success: false, message: 'Learning service unavailable. Please contact your manager.' });
    }

    const { data: credits, error: creditError } = await supabase.supabaseAdmin
      .from('student_credits')
      .select('remaining_credits')
      .eq('student_id', studentId)
      .maybeSingle();

    if (creditError) throw creditError;
    if (!credits || credits.remaining_credits <= 0) {
      return res.status(403).json({ success: false, message: 'Insufficient credits to start video.' });
    }

    // 1.5 Lookup learning video UUID by the youtube string video_id
    const { data: learningVideo, error: lvError } = await supabase.supabaseAdmin
      .from('learning_videos')
      .select('id')
      .eq('video_id', video_id)
      .maybeSingle();
      
    if (lvError) throw lvError;
    if (!learningVideo) {
      return res.status(404).json({ success: false, message: 'Learning video not found in database.' });
    }

    // 2. Create session
    const { data: session, error: insertError } = await supabase.supabaseAdmin
      .from('video_watch_sessions')
      .insert({
        student_id: studentId,
        video_id: learningVideo.id,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(200).json({ success: true, session });
  } catch (err) {
    console.error('Error starting video session:', err.message);
    res.status(500).json({ success: false, message: 'Server error starting video session' });
  }
};

// @desc    Update watch progress and burn credits
// @route   POST /api/video/progress
exports.updateVideoProgress = async (req, res) => {
  const studentId = req.user.id;
  const { session_id, watched_seconds_increment } = req.body;

  if (!session_id || !watched_seconds_increment) {
    return res.status(400).json({ success: false, message: 'session_id and watched_seconds_increment are required' });
  }

  try {
    // 1. Get session
    const { data: session, error: sessionError } = await supabase.supabaseAdmin
      .from('video_watch_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('student_id', studentId)
      .maybeSingle();

    if (sessionError) throw sessionError;
    if (!session || session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Invalid or inactive session.' });
    }

    // 2. Check learning service status and get current credits
    const { data: userProfile, error: userError } = await supabase.supabaseAdmin
      .from('users')
      .select('learning_service_enabled')
      .eq('id', studentId)
      .maybeSingle();
      
    if (userError) throw userError;
    if (!userProfile || userProfile.learning_service_enabled === false) {
      return res.status(403).json({ success: false, message: 'Learning service unavailable. Please contact your manager.' });
    }

    const { data: credits, error: creditError } = await supabase.supabaseAdmin
      .from('student_credits')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (creditError) throw creditError;
    if (!credits || credits.remaining_credits <= 0) {
      return res.status(403).json({ success: false, message: 'Insufficient credits.' });
    }

    const totalWatchedSeconds = session.watch_seconds + watched_seconds_increment;
    const previousCreditsBurned = session.credits_burned;
    const targetCreditsBurned = Math.floor(totalWatchedSeconds / SECONDS_PER_CREDIT);
    
    let creditsToBurnNow = targetCreditsBurned - previousCreditsBurned;
    
    // Ensure we don't burn more credits than remaining
    if (creditsToBurnNow > credits.remaining_credits) {
      creditsToBurnNow = credits.remaining_credits;
    }

    // 3. Burn credits if needed
    let remaining_credits = credits.remaining_credits;
    let used_credits = credits.used_credits;
    
    if (creditsToBurnNow > 0) {
      remaining_credits -= creditsToBurnNow;
      used_credits += creditsToBurnNow;

      const { error: updateCreditError } = await supabase.supabaseAdmin
        .from('student_credits')
        .update({
          remaining_credits: remaining_credits,
          used_credits: used_credits,
          updated_at: new Date()
        })
        .eq('student_id', studentId);

      if (updateCreditError) throw updateCreditError;

      // 4. Record transaction
      await supabase.supabaseAdmin
        .from('credit_transactions')
        .insert({
          student_id: studentId,
          transaction_type: 'VIDEO_WATCH',
          credits: creditsToBurnNow,
          balance_after: remaining_credits,
          description: `Burned ${creditsToBurnNow} credit(s) for watching video.`,
          video_id: session.video_id,
          watch_seconds: creditsToBurnNow * SECONDS_PER_CREDIT
        });
    }

    // 5. Update session
    const updatedCreditsBurned = previousCreditsBurned + creditsToBurnNow;
    
    const { data: updatedSession, error: updateSessionError } = await supabase.supabaseAdmin
      .from('video_watch_sessions')
      .update({
        watch_seconds: totalWatchedSeconds,
        credits_burned: updatedCreditsBurned
      })
      .eq('id', session_id)
      .select()
      .single();

    if (updateSessionError) throw updateSessionError;

    res.status(200).json({ 
      success: true, 
      session: updatedSession,
      remaining_credits,
      used_credits
    });
  } catch (err) {
    console.error('Error updating video progress:', err.message);
    res.status(500).json({ success: false, message: 'Server error updating progress' });
  }
};

// @desc    End a video watch session
// @route   POST /api/video/end
exports.endVideoSession = async (req, res) => {
  const studentId = req.user.id;
  const { session_id, percentage_watched } = req.body;

  if (!session_id) {
    return res.status(400).json({ success: false, message: 'session_id is required' });
  }

  try {
    let status = 'abandoned';
    if (percentage_watched >= 95) {
      status = 'completed';
    }

    const { data: session, error: updateError } = await supabase.supabaseAdmin
      .from('video_watch_sessions')
      .update({
        status: status,
        ended_at: new Date()
      })
      .eq('id', session_id)
      .eq('student_id', studentId)
      .select('*, learning_videos(title)')
      .single();

    if (updateError) throw updateError;

    if (status === 'completed') {
      const videoTitle = session.learning_videos?.title || 'a lesson';
      await createNotification(
        studentId,
        'Lesson Completed',
        `Congratulations on completing ${videoTitle}!`,
        'learning'
      );
    }

    res.status(200).json({ success: true, session });
  } catch (err) {
    console.error('Error ending video session:', err.message);
    res.status(500).json({ success: false, message: 'Server error ending session' });
  }
};

// @desc    Get student watch history
// @route   GET /api/student/watch-history
exports.getWatchHistory = async (req, res) => {
  const studentId = req.user.id;
  try {
    const { data: sessions, error } = await supabase.supabaseAdmin
      .from('video_watch_sessions')
      .select('*, learning_videos(title)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, sessions });
  } catch (err) {
    console.error('Error getting watch history:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving watch history' });
  }
};

// @desc    Get all student watch sessions for Admin Monitoring
// @route   GET /api/video/monitoring
exports.getMonitoringSessions = async (req, res) => {
  const role = req.user.role;
  const userId = req.user.id;
  
  try {
    let query = supabase.supabaseAdmin
      .from('video_watch_sessions')
      .select(`
        *,
        users!video_watch_sessions_student_id_fkey (
          id, username, parent_id, learning_service_enabled
        ),
        learning_videos (title)
      `)
      .order('updated_at', { ascending: false });

    // Enforce hierarchy for Manager/Institute
    if (role !== 'superadmin' && role !== 'admin') {
      // In a more robust system, we would do a recursive query to get all children.
      // For this simplified example, we'll fetch all sessions and filter in-memory
      // since Supabase doesn't natively support nested JSON filtering easily via PostgREST.
    }

    const { data: sessions, error } = await query;
    if (error) throw error;

    let filteredSessions = sessions;
    if (role !== 'superadmin' && role !== 'admin') {
      // Fetch all users under this manager/institute (simplified check)
      const { data: validUsers } = await supabase.supabaseAdmin
        .from('users')
        .select('id')
        .eq('parent_id', userId);
        
      const validUserIds = validUsers ? validUsers.map(u => u.id) : [];
      filteredSessions = sessions.filter(s => s.users && validUserIds.includes(s.users.id));
    }

    res.status(200).json({ success: true, sessions: filteredSessions });
  } catch (err) {
    console.error('Error in monitoring:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving monitoring data' });
  }
};
