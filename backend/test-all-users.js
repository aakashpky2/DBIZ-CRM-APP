const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { supabaseAdmin } = require('./config/supabase');

async function test() {
  const { data, error, count } = await supabaseAdmin
    .from('users')
    .select('username');

  console.log('All users in DB:', data?.map(d => d.username));
  process.exit(0);
}
test();
