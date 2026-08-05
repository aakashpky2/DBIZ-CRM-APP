const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('SUPABASE_ANON_KEY');
  if (!supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  throw new Error(`Missing shared Supabase configuration. Set ${missing.join(', ')}.`);
}

console.log('[Shared Supabase]', {
  urlConfigured: Boolean(process.env.SUPABASE_URL),
  anonKeyConfigured: Boolean(process.env.SUPABASE_ANON_KEY),
  serviceKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  projectHost: process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : null,
});

const supabase = createClient(supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, ''), supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const supabaseAdmin = createClient(supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, ''), supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

module.exports = {
  supabase,
  supabaseAdmin,
};
