const supabase = require('../config/supabase');

const logAudit = async (userId, role, actionType, moduleName, burned, added, balanceAfter, status = 'success') => {
  try {
    await supabase.supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      role: role || 'student',
      action_type: actionType,
      module: moduleName,
      credits_burned: burned,
      credits_added: added,
      balance_after: balanceAfter,
      status: status
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

const getWallet = async (userId) => {
  const { data } = await supabase.supabaseAdmin
    .from('student_credits')
    .select('*')
    .eq('student_id', userId)
    .maybeSingle();
  return data;
};

const updateWallet = async (userId, burned) => {
  // Use a fallback logic if the RPC isn't installed. 
  // Normally we would use a postgres function for atomic decrement.
  const wallet = await getWallet(userId);
  if (!wallet) throw new Error('Wallet not found');
  if (wallet.remaining_credits < burned) throw new Error('Insufficient credits');
  
  const newUsed = wallet.used_credits + burned;
  const newRemaining = wallet.remaining_credits - burned;
  
  const { data: updated, error } = await supabase.supabaseAdmin
    .from('student_credits')
    .update({ used_credits: newUsed, remaining_credits: newRemaining })
    .eq('student_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return updated;
};

exports.startSession = async (req, res, next) => {
  const userId = req.user.id;
  const { moduleName } = req.body;
  
  try {
    // Complete previous active sessions
    await supabase.supabaseAdmin
      .from('learning_sessions')
      .update({ status: 'completed' })
      .eq('user_id', userId)
      .eq('status', 'active');
      
    // Start new session
    const { data: session, error } = await supabase.supabaseAdmin
      .from('learning_sessions')
      .insert({
        user_id: userId,
        module_name: moduleName,
        start_time: new Date().toISOString(),
        last_pulse_time: new Date().toISOString(),
        active_duration_seconds: 0,
        status: 'active',
        credits_burned: 0
      })
      .select()
      .single();
      
    if (error) throw error;
    
    res.status(200).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

exports.sessionPulse = async (req, res, next) => {
  const userId = req.user.id;
  const { sessionId, activeDurationSeconds } = req.body; // frontend reports duration
  
  try {
    const { data: session, error } = await supabase.supabaseAdmin
      .from('learning_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();
      
    if (error || !session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    if (session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session is not active' });
    }
    
    const now = new Date();
    const lastPulse = new Date(session.last_pulse_time);
    
    // Calculate new total duration
    const elapsedSinceLastPulse = Math.floor((now - lastPulse) / 1000);
    const newDuration = session.active_duration_seconds + elapsedSinceLastPulse;
    
    let expectedBurn = 0;
    if (newDuration >= 600) {
      if (newDuration < 1800) {
        expectedBurn = 1;
      } else if (newDuration < 3600) {
        expectedBurn = 2;
      } else {
        const extraBlocks = Math.floor((newDuration - 3600) / 1800);
        expectedBurn = 2 + 1 + extraBlocks;
      }
    }
    
    const additionalBurn = expectedBurn - session.credits_burned;
    
    if (additionalBurn > 0) {
      const wallet = await getWallet(userId);
      if (wallet && wallet.remaining_credits >= additionalBurn) {
        // Deduct
        const updatedWallet = await updateWallet(userId, additionalBurn);
        
        await supabase.supabaseAdmin
          .from('learning_sessions')
          .update({
            active_duration_seconds: newDuration,
            last_pulse_time: now.toISOString(),
            credits_burned: expectedBurn
          })
          .eq('id', sessionId);
          
        await logAudit(userId, req.user.role, 'time_deduction', session.module_name, additionalBurn, 0, updatedWallet.remaining_credits);
      } else {
        // Insufficient credits, force pause
        await supabase.supabaseAdmin
          .from('learning_sessions')
          .update({
            active_duration_seconds: newDuration,
            last_pulse_time: now.toISOString(),
            status: 'paused'
          })
          .eq('id', sessionId);
          
        return res.status(402).json({ success: false, message: 'Insufficient credits. Session paused.', action: 'stop' });
      }
    } else {
      // Just update time
      await supabase.supabaseAdmin
        .from('learning_sessions')
        .update({
          active_duration_seconds: newDuration,
          last_pulse_time: now.toISOString()
        })
        .eq('id', sessionId);
    }
    
    res.status(200).json({ success: true, activeDurationSeconds: newDuration, creditsBurned: expectedBurn });
  } catch (err) {
    next(err);
  }
};

exports.premiumAction = async (req, res, next) => {
  const userId = req.user.id;
  const { actionKey, moduleName } = req.body;
  
  try {
    const { data: config } = await supabase.supabaseAdmin
      .from('credit_configuration')
      .select('credit_cost')
      .eq('action_key', actionKey)
      .single();
      
    const cost = config ? config.credit_cost : 1;
    
    if (cost > 0) {
      const wallet = await getWallet(userId);
      if (!wallet || wallet.remaining_credits < cost) {
        return res.status(402).json({ success: false, message: 'Insufficient credits for this premium action.' });
      }
      
      const updatedWallet = await updateWallet(userId, cost);
      await logAudit(userId, req.user.role, 'premium_action', moduleName || actionKey, cost, 0, updatedWallet.remaining_credits);
    }
    
    res.status(200).json({ success: true, message: 'Action approved', cost });
  } catch (err) {
    next(err);
  }
};
