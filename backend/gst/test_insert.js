require('dotenv').config();
const supabase = require('./config/supabase');

async function testSelect() {
    console.log("Testing select all users...");
    const { data, error } = await supabase.from('users').select('*');
    
    if (error) {
        console.error("Error selecting:", error);
    } else {
        console.log("Success:", JSON.stringify(data.slice(-2), null, 2));
    }
}

testSelect().then(() => process.exit(0));
