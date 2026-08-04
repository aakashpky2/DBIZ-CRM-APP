const supabase = require('./config/supabase');

async function checkUsers() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('username, email, user_type');

        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Users in DB:', data);
        }
    } catch (e) {
        console.error('Err:', e.message);
    }
}

checkUsers();
