const supabase = require('../config/supabase');

const mockData = [
    { year: 2026, state: 'Maharashtra', holiday_date: '2026-01-26', holiday_day: 'Monday', description: 'Republic Day', type: 'National' },
    { year: 2026, state: 'Maharashtra', holiday_date: '2026-02-19', holiday_day: 'Thursday', description: 'Chhatrapati Shivaji Maharaj Jayanti', type: 'State' },
    { year: 2026, state: 'Maharashtra', holiday_date: '2026-03-20', holiday_day: 'Friday', description: 'Gudi Padwa', type: 'State' },
    { year: 2026, state: 'Maharashtra', holiday_date: '2026-05-01', holiday_day: 'Friday', description: 'Maharashtra Day', type: 'State' },
    { year: 2026, state: 'Maharashtra', holiday_date: '2026-08-15', holiday_day: 'Saturday', description: 'Independence Day', type: 'National' },
    { year: 2026, state: 'Maharashtra', holiday_date: '2026-10-02', holiday_day: 'Friday', description: 'Mahatma Gandhi Jayanti', type: 'National' },
    { year: 2026, state: 'Maharashtra', holiday_date: '2026-11-09', holiday_day: 'Monday', description: 'Diwali (Bali Pratipada)', type: 'Festival' },
    { year: 2026, state: 'Maharashtra', holiday_date: '2026-12-25', holiday_day: 'Friday', description: 'Christmas', type: 'National' }
];

exports.searchHolidays = async (req, res) => {
    try {
        const { year, state } = req.body;

        if (!year || !state) {
            return res.status(400).json({ success: false, error: 'Year and State are mandatory fields.' });
        }

        const { data, error } = await supabase
            .from('holiday_list')
            .select('*')
            .eq('year', parseInt(year))
            .eq('state', state)
            .order('holiday_date', { ascending: true });

        if (error) {
            if (error.code === '42P01') {
                console.warn("Table holiday_list does not exist. Using mock data.");
                const results = mockData.filter(item => item.year === parseInt(year) && item.state === state);
                return res.status(200).json({ success: true, data: results });
            }
            throw error;
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Error in searchHolidays:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
