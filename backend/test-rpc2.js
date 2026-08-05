const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function inspectRPC() {
  const { data: procInfo, error: procError } = await supabaseAdmin.rpc('exec_sql', { sql: "SELECT prosrc FROM pg_proc WHERE proname = 'atomic_save_business_details_and_burn'" });
  if (procError) {
    console.error(procError);
  } else {
    console.log(procInfo);
  }
}
inspectRPC();
