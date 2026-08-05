const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { supabaseAdmin } = require('./config/supabase');

async function inspectRPC() {
  const { data: procInfo, error: procError } = await supabaseAdmin.rpc('exec_sql', { sql: "SELECT prosrc FROM pg_proc WHERE proname = 'atomic_save_business_details_and_burn'" });
  if (procError) {
    console.error(procError);
  } else {
    console.log(procInfo);
  }
}
inspectRPC();
