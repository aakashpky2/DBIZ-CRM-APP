require('dotenv').config();
const supabase = require('./config/supabase');

async function testSelect() {
    console.log("Fetching latest users from DB...");
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
    
    if (error) {
        console.error("Error fetching users:", error);
    } else {
        console.log("Latest users:", JSON.stringify(data, null, 2));
    }
}

testSelect().then(() => process.exit(0));
