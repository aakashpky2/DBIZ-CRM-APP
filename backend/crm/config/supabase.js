const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

let supabaseUrl = process.env.CRM_SUPABASE_URL || process.env.SUPABASE_URL;
if (supabaseUrl) {
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
}
const supabaseKey = process.env.CRM_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.CRM_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Anon Key are required in .env');
}

// Client for normal user authentication
const supabase = createClient(supabaseUrl, supabaseKey);

// Client with administrative privileges (service role)
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

// Attach supabaseAdmin to the default supabase export for maximum backward compatibility
supabase.supabaseAdmin = supabaseAdmin;

module.exports = supabase;
