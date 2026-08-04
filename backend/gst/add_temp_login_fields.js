require('dotenv').config();
const supabase = require('./config/supabase');

const alterTableSQL = `
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS temporary_username TEXT UNIQUE;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS temporary_password_hash TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_temporary_login BOOLEAN DEFAULT false;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_login_completed BOOLEAN DEFAULT false;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'Active';
`;

async function addTempLoginFields() {
    console.log("Adding temp login fields to users table...");
    try {
        const { error } = await supabase.rpc('exec_sql', { sql: alterTableSQL });
        if (error) {
            console.error("Error executing SQL:", error.message);
        } else {
            console.log("Successfully added fields to users table.");
        }
    } catch (e) {
        console.error("Fatal error:", e.message);
    }
}

addTempLoginFields().then(() => process.exit(0));
