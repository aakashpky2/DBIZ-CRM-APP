const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { supabaseAdmin } = require('./config/supabase');

async function testRPC2() {
  const { data, error } = await supabaseAdmin.rpc('atomic_save_tab_and_burn', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_trn: 'TEST-1234',
      p_tab_name: 'test_tab',
      p_tab_data: {},
      p_action_key: 'reg_started'
  });
  console.log('RPC Result:', { data, error });
}
testRPC2();
