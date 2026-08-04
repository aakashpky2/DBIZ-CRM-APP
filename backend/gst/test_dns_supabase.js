const dns = require('node:dns');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Force DNS servers to Google's
dns.setServers(['8.8.8.8', '1.1.1.1']);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log(`Testing Supabase at ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    try {
        console.log('Sending query...');
        const { data, error } = await supabase.from('master_user_types').select('name');
        if (error) {
            console.error('Supabase Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('Success! Found:', data);
        }
    } catch (e) {
        console.error('Fetch Crash:', e.message);
    }
}

test();
