const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { supabase, supabaseAdmin } = require('./config/supabase');

async function test() {
  const { data, error, count } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })
    .eq('id', 'f7054b05-0d30-46c7-b363-52d1165e33fc');

  console.log('Duplicate check:', {
    rows: data?.length,
    error: error?.message,
    ids: data?.map(d => d.id)
  });
  process.exit(0);
}
test();
