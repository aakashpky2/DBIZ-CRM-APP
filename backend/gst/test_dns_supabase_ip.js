const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL; // https://yzpifccqmzawoomhmyjx.supabase.co
const supabaseKey = process.env.SUPABASE_KEY;

// Custom fetch to override DNS manually via Host header + IP
const customFetch = async (url, options = {}) => {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'yzpifccqmzawoomhmyjx.supabase.co') {
        const originalHost = urlObj.hostname;
        // Use Cloudflare IP (Supabase uses CF)
        urlObj.hostname = '104.18.38.10';

        const newUrl = urlObj.toString();

        options.headers = {
            ...options.headers,
            'Host': originalHost
        };

        console.log(`Rewriting ${url} -> ${newUrl}`);
        return fetch(newUrl, options);
    }
    return fetch(url, options);
};

const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { fetch: customFetch }
});

async function test() {
    try {
        console.log('Sending query with manual DNS override (IP: 104.18.38.10)...');
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
