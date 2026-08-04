const supabase = require('../config/supabase');
const { createNotification } = require('../utils/notificationService');

// Helper to resolve student profile from database
const resolveStudentProfile = async (studentId) => {
  try {
    const { data, error } = await supabase.supabaseAdmin
      .from('users')
      .select('username, role')
      .eq('id', studentId)
      .maybeSingle();
      
    if (data) {
      return {
        name: data.username.split('@')[0],
        email: data.username
      };
    }
  } catch (err) {
    console.error('Error resolving student profile:', err.message);
  }
  return {
    name: 'Student ' + studentId.substring(0, 5),
    email: 'student@dbiz.com'
  };
};

// ==========================================
// STUDENT APIS
// ==========================================

// @desc    Get student credits (auto-create default 100 credits if not exists)
// @route   GET /api/student/credits
exports.getStudentCredits = async (req, res, next) => {
  const studentId = req.user.id;
  try {
    // Check if student credit record exists
    let { data: credits, error } = await supabase.supabaseAdmin
      .from('student_credits')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) throw error;

    // If no record exists, provision a fresh 100 free credits
    if (!credits) {
      const defaultCredits = {
        student_id: studentId,
        total_credits: 5,
        used_credits: 0,
        remaining_credits: 5
      };

      const { data: newCredits, error: createError } = await supabase.supabaseAdmin
        .from('student_credits')
        .insert(defaultCredits)
        .select()
        .single();

      if (createError) throw createError;
      credits = newCredits;

      // Add a transaction record for initial credits
      await supabase.supabaseAdmin
        .from('credit_transactions')
        .insert({
          student_id: studentId,
          transaction_type: 'credit_added',
          credits: 100,
          balance_after: 100,
          description: 'Initial free learning credits'
        });
    }

    res.status(200).json({
      success: true,
      credits
    });
  } catch (err) {
    console.error('Error getting student credits:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving credits' });
  }
};

// @desc    Request additional credits
// @route   POST /api/student/credits/request
exports.requestCredits = async (req, res, next) => {
  const studentId = req.user.id;
  const { requested_credits, reason } = req.body;

  if (!requested_credits || requested_credits <= 0) {
    return res.status(400).json({ success: false, message: 'Requested credits must be greater than 0' });
  }
  if (!reason || !reason.trim()) {
    return res.status(400).json({ success: false, message: 'Reason is required' });
  }

  try {
    // Do not allow duplicate pending requests
    const { data: pending, error: checkError } = await supabase.supabaseAdmin
      .from('credit_requests')
      .select('id')
      .eq('student_id', studentId)
      .eq('status', 'pending')
      .maybeSingle();

    if (pending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending credit request.'
      });
    }

    const { data: request, error: insertError } = await supabase.supabaseAdmin
      .from('credit_requests')
      .insert({
        student_id: studentId,
        requested_credits: parseInt(requested_credits),
        reason: reason.trim(),
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(200).json({
      success: true,
      message: 'Credit request submitted successfully.',
      request
    });
  } catch (err) {
    console.error('Error requesting credits:', err.message);
    res.status(500).json({ success: false, message: 'Server error processing request' });
  }
};

// @desc    Get student credit transaction history
// @route   GET /api/student/credits/transactions
exports.getStudentTransactions = async (req, res, next) => {
  const studentId = req.user.id;
  try {
    const { data: transactions, error } = await supabase.supabaseAdmin
      .from('credit_transactions')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, transactions: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get Credit Configurations
// @route   GET /api/superadmin/credit-config
// @access  Private/SuperAdmin
exports.getCreditConfig = async (req, res) => {
  try {
    const { data, error } = await supabase.supabaseAdmin.from('credit_configuration').select('*').order('action_key');
    if (error) throw error;
    res.status(200).json({ success: true, config: data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update Credit Configuration
// @route   PUT /api/superadmin/credit-config/:key
// @access  Private/SuperAdmin
exports.updateCreditConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const { credit_cost } = req.body;
    const { data, error } = await supabase.supabaseAdmin
      .from('credit_configuration')
      .update({ credit_cost })
      .eq('action_key', key)
      .select();
    if (error) throw error;
    res.status(200).json({ success: true, config: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ==========================================
// CREDIT BURNING LOGIC
// ==========================================

// @desc    Deduct/burn credits for using a service
// @route   POST /api/student/credits/burn
exports.burnCredits = async (req, res, next) => {
  const studentId = req.user.id;
  const { required_credits, description } = req.body;

  if (!required_credits || required_credits <= 0) {
    return res.status(400).json({ success: false, message: 'Required credits must be greater than 0' });
  }

  try {
    // 1. Fetch current credits
    const { data: credits, error: fetchError } = await supabase.supabaseAdmin
      .from('student_credits')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!credits || credits.remaining_credits < required_credits) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credits. Please request more credits.'
      });
    }

    const updatedRemaining = credits.remaining_credits - required_credits;
    const updatedUsed = credits.used_credits + required_credits;

    // 2. Safe update of credits
    const { data: updatedCredits, error: updateError } = await supabase.supabaseAdmin
      .from('student_credits')
      .update({
        remaining_credits: updatedRemaining,
        used_credits: updatedUsed,
        updated_at: new Date()
      })
      .eq('student_id', studentId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Create credit_used transaction
    await supabase.supabaseAdmin
      .from('credit_transactions')
      .insert({
        student_id: studentId,
        transaction_type: 'credit_used',
        credits: required_credits,
        balance_after: updatedRemaining,
        description: description || 'Used credit-based service'
      });

    // Notify if credits exhausted
    if (updatedRemaining <= 0) {
      await createNotification(
        studentId,
        'Credits Exhausted',
        'Your learning credits have run out. Please request more to continue learning.',
        'learning',
        '/student/dashboard'
      );
    }

    res.status(200).json({
      success: true,
      message: 'Credits burned successfully',
      remaining_credits: updatedRemaining
    });
  } catch (err) {
    console.error('Error burning credits:', err.message);
    res.status(500).json({ success: false, message: 'Server error processing transaction' });
  }
};

// ==========================================
// SUPER ADMIN APIS
// ==========================================

// @desc    Get all student credit requests
// @route   GET /api/superadmin/credit-requests
exports.getSuperadminCreditRequests = async (req, res, next) => {
  try {
    const { data: requests, error } = await supabase.supabaseAdmin
      .from('credit_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Join student details manually for robust fallback
    const requestsWithStudent = await Promise.all(
      requests.map(async (reqItem) => {
        const studentProfile = await resolveStudentProfile(reqItem.student_id);
        
        // Fetch current remaining credits of the student
        let remaining = 0;
        const { data: credits } = await supabase.supabaseAdmin
          .from('student_credits')
          .select('remaining_credits')
          .eq('student_id', reqItem.student_id)
          .maybeSingle();
        if (credits) {
          remaining = credits.remaining_credits;
        }

        return {
          ...reqItem,
          student_name: studentProfile.name,
          student_email: studentProfile.email,
          current_remaining: remaining
        };
      })
    );

    res.status(200).json({
      success: true,
      requests: requestsWithStudent
    });
  } catch (err) {
    console.error('Error getting admin credit requests:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving credit requests' });
  }
};

// @desc    Approve a student credit request
// @route   POST /api/superadmin/credit-requests/:id/approve
exports.approveCreditRequest = async (req, res, next) => {
  const requestId = req.params.id;
  const adminId = req.user.id;

  try {
    // 1. Get the request details
    const { data: request, error: reqError } = await supabase.supabaseAdmin
      .from('credit_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (reqError) throw reqError;
    if (!request) {
      return res.status(404).json({ success: false, message: 'Credit request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    // 2. Fetch or provision student credit record
    let { data: credits, error: creditError } = await supabase.supabaseAdmin
      .from('student_credits')
      .select('*')
      .eq('student_id', request.student_id)
      .maybeSingle();

    if (creditError) throw creditError;

    let newTotal = request.requested_credits;
    let newRemaining = request.requested_credits;
    let newUsed = 0;

    if (credits) {
      newTotal = credits.total_credits + request.requested_credits;
      newRemaining = credits.remaining_credits + request.requested_credits;
      newUsed = credits.used_credits;

      // Update existing record
      const { error: updateError } = await supabase.supabaseAdmin
        .from('student_credits')
        .update({
          total_credits: newTotal,
          remaining_credits: newRemaining,
          updated_at: new Date()
        })
        .eq('student_id', request.student_id);

      if (updateError) throw updateError;
    } else {
      // Create new record
      const { error: insertError } = await supabase.supabaseAdmin
        .from('student_credits')
        .insert({
          student_id: request.student_id,
          total_credits: newTotal,
          used_credits: 0,
          remaining_credits: newRemaining
        });

      if (insertError) throw insertError;
    }

    // 3. Mark request as approved
    const { error: markError } = await supabase.supabaseAdmin
      .from('credit_requests')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date()
      })
      .eq('id', requestId);

    if (markError) throw markError;

    // 4. Record the credit transaction
    await supabase.supabaseAdmin
      .from('credit_transactions')
      .insert({
        student_id: request.student_id,
        transaction_type: 'credit_request_approved',
        credits: request.requested_credits,
        balance_after: newRemaining,
        description: `Approved request: ${request.reason}`,
        created_by: adminId
      });

    // Notify student
    await createNotification(
      request.student_id,
      'Credit Request Approved',
      `${request.requested_credits} credits have been added to your account.`,
      'learning',
      '/student/dashboard'
    );

    res.status(200).json({
      success: true,
      message: 'Credits added successfully.'
    });
  } catch (err) {
    console.error('Error approving credit request:', err.message);
    res.status(500).json({ success: false, message: 'Server error approving request' });
  }
};

// @desc    Reject a student credit request
// @route   POST /api/superadmin/credit-requests/:id/reject
exports.rejectCreditRequest = async (req, res, next) => {
  const requestId = req.params.id;
  const adminId = req.user.id;

  try {
    // 1. Get the request details
    const { data: request, error: reqError } = await supabase.supabaseAdmin
      .from('credit_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (reqError) throw reqError;
    if (!request) {
      return res.status(404).json({ success: false, message: 'Credit request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    // 2. Mark request as rejected
    const { error: markError } = await supabase.supabaseAdmin
      .from('credit_requests')
      .update({
        status: 'rejected',
        rejected_by: adminId,
        rejected_at: new Date()
      })
      .eq('id', requestId);

    if (markError) throw markError;

    // 3. Optional: add rejected transaction record
    let remaining = 0;
    const { data: credits } = await supabase.supabaseAdmin
      .from('student_credits')
      .select('remaining_credits')
      .eq('student_id', request.student_id)
      .maybeSingle();
    if (credits) {
      remaining = credits.remaining_credits;
    }

    await supabase.supabaseAdmin
      .from('credit_transactions')
      .insert({
        student_id: request.student_id,
        transaction_type: 'credit_request_rejected',
        credits: request.requested_credits,
        balance_after: remaining,
        description: `Rejected request: ${request.reason}`,
        created_by: adminId
      });

    // Notify student
    await createNotification(
      request.student_id,
      'Credit Request Rejected',
      `Your request for ${request.requested_credits} credits was rejected.`,
      'learning',
      '/student/dashboard'
    );

    res.status(200).json({
      success: true,
      message: 'Credit request rejected.'
    });
  } catch (err) {
    console.error('Error rejecting credit request:', err.message);
    res.status(500).json({ success: false, message: 'Server error rejecting request' });
  }
};

// @desc    Get all system credit transactions
// @route   GET /api/superadmin/credit-transactions
exports.getSuperadminTransactions = async (req, res, next) => {
  try {
    const { data: transactions, error } = await supabase.supabaseAdmin
      .from('credit_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Manually join student names and emails
    const transactionsWithStudent = await Promise.all(
      transactions.map(async (t) => {
        const studentProfile = await resolveStudentProfile(t.student_id);
        return {
          ...t,
          student_name: studentProfile.name,
          student_email: studentProfile.email
        };
      })
    );

    res.status(200).json({
      success: true,
      transactions: transactionsWithStudent
    });
  } catch (err) {
    console.error('Error getting admin credit transactions:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving transactions' });
  }
};
