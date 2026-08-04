const bcrypt = require('bcryptjs');
const supabase = require('./config/supabase');

async function seed() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Kasthu@123', salt);

        // Check if user exists
        const { data: user } = await supabase.from('users').select('*').eq('username', 'Kasthu@123').single();
        if (user) {
            console.log('User found, updating password...');
            const { error } = await supabase.from('users').update({ password: hashedPassword }).eq('username', 'Kasthu@123');
            if (error) console.error('Update error:', error);
            else console.log('Update successful!');
        } else {
            console.log('User not found, creating...');
            const { error } = await supabase.from('users').insert({ username: 'Kasthu@123', password: hashedPassword, email: 'kasthu@example.com', user_type: 'Taxpayer' });
            if (error) console.error('Insert error:', error);
            else console.log('Insert successful!');
        }
    } catch (e) {
        console.error(e);
    }
}
seed();
