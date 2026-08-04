const supabase = require('../config/supabase');

const mockData = [
    { name: 'Rajesh Kumar', gstp_id: 'GSTP27MUM001', enrollment_number: 'ENR2023MH1234', mobile: '9876543210', email: 'rajesh.kumar@email.com', state: 'Maharashtra', district: 'Mumbai', status: 'Active' },
    { name: 'Priya Sharma', gstp_id: 'GSTP07DEL002', enrollment_number: 'ENR2023DL5678', mobile: '9988776655', email: 'priya.sharma@email.com', state: 'Delhi', district: 'New Delhi', status: 'Active' },
    { name: 'Amit Patel', gstp_id: 'GSTP24AHD003', enrollment_number: 'ENR2023GJ9012', mobile: '9123456789', email: 'amit.patel@email.com', state: 'Gujarat', district: 'Ahmedabad', status: 'Inactive' }
];

exports.searchGstp = async (req, res) => {
    try {
        const { searchType, idValue, nameValue, stateValue, districtValue } = req.body;

        if (!searchType) {
            return res.status(400).json({ success: false, error: 'Search Type is required.' });
        }

        let query = supabase.from('gst_practitioners').select('*');

        if (searchType === 'id') {
            if (!idValue) return res.status(400).json({ success: false, error: 'Enrollment Number/GSTP ID is required.' });
            query = query.or(`gstp_id.eq.${idValue},enrollment_number.eq.${idValue}`);
        } else if (searchType === 'name_area') {
            if (nameValue) query = query.ilike('name', `%${nameValue}%`);
            if (stateValue) query = query.eq('state', stateValue);
            if (districtValue) query = query.eq('district', districtValue);
        } else {
            return res.status(400).json({ success: false, error: 'Invalid search type.' });
        }

        const { data, error } = await query;

        if (error) {
            if (error.code === '42P01') {
                console.warn("Table gst_practitioners does not exist. Using mock data.");
                let results = [...mockData];
                if (searchType === 'id') {
                    results = results.filter(item => item.gstp_id === idValue || item.enrollment_number === idValue);
                } else {
                    if (nameValue) results = results.filter(item => item.name.toLowerCase().includes(nameValue.toLowerCase()));
                    if (stateValue) results = results.filter(item => item.state === stateValue);
                    if (districtValue) results = results.filter(item => item.district === districtValue);
                }
                return res.status(200).json({ success: true, data: results });
            }
            throw error;
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Error in searchGstp:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
