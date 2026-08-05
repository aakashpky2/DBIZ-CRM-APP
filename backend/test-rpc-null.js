const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { supabaseAdmin } = require('./config/supabase');

async function testRPC() {
  const { data, error } = await supabaseAdmin.rpc('atomic_save_business_details_and_burn', {
      p_user_id: null,
      p_trn: 'TEST-1234',
      p_payload: { legal_name: 'Test', state_name: 'Delhi' },
      p_action_key: 'reg_started'
  });
  console.log('RPC Result with null user_id:', { data, error });
}
testRPC();
