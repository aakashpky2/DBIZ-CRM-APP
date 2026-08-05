const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function inspectRPC() {
  const { data, error } = await supabaseAdmin.rpc('atomic_save_business_details_and_burn', { p_user_id: '1', p_trn: '1', p_payload: {} });
  // Wait, I can't easily inspect the SQL definition from the client unless I query pg_proc.
  const { data: procInfo, error: procError } = await supabaseAdmin.rpc('exec_sql', { sql: "SELECT prosrc FROM pg_proc WHERE proname = 'atomic_save_business_details_and_burn'" });
  if (procError) {
    console.error('Cannot query pg_proc directly, trying HTTP query');
  } else {
    console.log(procInfo);
  }
}
inspectRPC();
