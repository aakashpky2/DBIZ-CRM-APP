const supabase = require('../config/supabase');

// @desc    Get all items
// @route   GET /api/items
exports.getItems = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.supabaseAdmin
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      total: count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      },
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new item
// @route   POST /api/items
exports.createItem = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    
    const { data, error } = await supabase.supabaseAdmin
      .from('projects')
      .insert([
        { 
          name, 
          description, 
          status, 
          user_id: req.user.id 
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
exports.updateItem = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    
    const { data, error } = await supabase.supabaseAdmin
      .from('projects')
      .update({ name, description, status })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select();

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({ message: 'Item not found or unauthorized' });
    }

    res.status(200).json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
exports.deleteItem = async (req, res, next) => {
  try {
    const { error } = await supabase.supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
