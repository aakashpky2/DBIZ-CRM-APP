const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { supabaseAdmin } = require('./config/supabase');

async function checkRPCs() {
  const { data, error } = await supabaseAdmin.rpc('burn_credits', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_action_key: 'reg_started'
  });
  console.log('burn_credits:', { data, error });
}
checkRPCs();
