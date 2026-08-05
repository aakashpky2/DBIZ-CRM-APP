const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { supabase, supabaseAdmin } = require('./config/supabase');

async function test() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', 'f7054b05-0d30-46c7-b363-52d1165e33fc')
    .maybeSingle();

  console.log('Profile query result:', {
    profileFound: Boolean(data),
    errorCode: error?.code || null,
    errorMessage: error?.message || null,
    errorDetails: error?.details || null,
    errorHint: error?.hint || null,
  });
  process.exit(0);
}
test();
