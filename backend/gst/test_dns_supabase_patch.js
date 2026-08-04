const dns = require('node:dns');

// Get the original lookup
const originalLookup = dns.lookup;

// Monkey-patch dns.lookup
dns.lookup = (hostname, options, callback) => {
    // If options is a function, it's actually the callback
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    if (hostname === 'yzpifccqmzawoomhmyjx.supabase.co') {
        console.log(`DNS Monkey-Patch: Resolving ${hostname} to forced IP 104.18.38.10`);
        return callback(null, [{ address: '104.18.38.10', family: 4 }], 4);
    }

    return originalLookup(hostname, options, callback);
};

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    try {
        console.log('Sending query with Global DNS lookup monkey-patch...');
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
