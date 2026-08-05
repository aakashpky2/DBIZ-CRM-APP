const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { supabaseAdmin } = require('./backend/config/supabase');

async function test() {
  const { data, error, count } = await supabaseAdmin
    .from('users')
    .select('*')
    .ilike('username', 'gst1234');

  console.log('Lookup check:', {
    rows: data?.length,
    error: error?.message,
    users: data?.map(d => ({ username: d.username, id: d.id, password_hash: d.password_hash }))
  });
  process.exit(0);
}
test();
