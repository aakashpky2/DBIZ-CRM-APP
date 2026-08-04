const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.GST_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.GST_SUPABASE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing GST Supabase configuration. Set GST_SUPABASE_URL and GST_SUPABASE_KEY.');
}

module.exports = createClient(supabaseUrl, supabaseKey);
