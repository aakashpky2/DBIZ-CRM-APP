const supabase = require('../config/supabase');

const mockTaxpayers = {
    '27AAAAA0000A1Z5': {
        id: 'mock-1',
        gstin: '27AAAAA0000A1Z5',
        legal_name: 'RELIANCE INDUSTRIES LIMITED',
        trade_name: 'RELIANCE INDUSTRIES LIMITED',
        constitution_of_business: 'Public Limited Company',
        taxpayer_type: 'Regular',
        registration_date: '01/07/2017',
        gst_status: 'Active',
        state_jurisdiction: 'State Tax Officer, Ward-X, Mumbai',
        centre_jurisdiction: 'Commissioner of Central Tax, Mumbai South',
        address: 'Maker Chambers IV, 222, Nariman Point',
        state: 'Maharashtra',
        district: 'Mumbai',
        pincode: '400021',
        created_at: new Date().toISOString()
    },
    '07BBBBB0000B1Z6': {
        id: 'mock-2',
        gstin: '07BBBBB0000B1Z6',
        legal_name: 'TATA MOTORS LIMITED',
        trade_name: 'TATA MOTORS',
        constitution_of_business: 'Public Limited Company',
        taxpayer_type: 'Regular',
        registration_date: '05/08/2017',
        gst_status: 'Cancelled',
        state_jurisdiction: 'State Tax Officer, Delhi',
        centre_jurisdiction: 'Commissioner of Central Tax, Delhi',
        address: 'Bombay House, 24 Homi Mody Street',
        state: 'Delhi',
        district: 'New Delhi',
        pincode: '110001',
        created_at: new Date().toISOString()
    },
    '29CCCCC0000C1Z7': {
        id: 'mock-3',
        gstin: '29CCCCC0000C1Z7',
        legal_name: 'INFOSYS LIMITED',
        trade_name: 'INFOSYS',
        constitution_of_business: 'Public Limited Company',
        taxpayer_type: 'SEZ Developer',
        registration_date: '10/09/2017',
        gst_status: 'Suspended',
        state_jurisdiction: 'State Tax Officer, Bengaluru',
        centre_jurisdiction: 'Commissioner of Central Tax, Bengaluru',
        address: 'Electronics City, Hosur Road',
        state: 'Karnataka',
        district: 'Bengaluru',
        pincode: '560100',
        created_at: new Date().toISOString()
    }
};

exports.searchByGSTIN = async (req, res) => {
    try {
        const { gstin } = req.params;
        
        if (!gstin || gstin.length !== 15) {
            return res.status(400).json({ success: false, error: 'Invalid GSTIN format. Must be 15 characters.' });
        }

        // Try querying Supabase
        const { data, error } = await supabase
            .from('business_details')
            .select('*')
            .eq('gstin', gstin)
            .single();

        if (error) {
            // If table doesn't exist or column doesn't exist, fall back to mock
            if (error.code === '42P01' || error.code === '42703' || error.code === 'PGRST116') {
                const mockData = mockTaxpayers[gstin.toUpperCase()];
                if (mockData) {
                    return res.status(200).json({ success: true, data: mockData });
                } else {
                    return res.status(404).json({ success: false, error: 'No Taxpayer Found for the Entered GSTIN/UIN.' });
                }
            }
            throw error;
        }

        if (data) {
            // Map business_details fields to expected output
            const mappedData = {
                id: data.id,
                gstin: data.gstin || gstin,
                legal_name: data.legal_name || 'N/A',
                trade_name: data.trade_name || 'N/A',
                constitution_of_business: data.constitution || 'N/A',
                taxpayer_type: data.taxpayer_type || (data.composition ? 'Composition' : 'Regular'),
                registration_date: data.commencement_date || data.liability_date || 'N/A',
                gst_status: 'Active', // Mocking status as Active for generic DB entries
                state_jurisdiction: data.state_name ? `State Tax, ${data.state_name}` : 'N/A',
                centre_jurisdiction: 'Central Tax',
                address: data.district ? `${data.district}, ${data.state_name}` : 'N/A',
                state: data.state_name || 'N/A',
                district: data.district || 'N/A',
                pincode: 'N/A',
                created_at: data.created_at || new Date().toISOString()
            };
            return res.status(200).json({ success: true, data: mappedData });
        } else {
            return res.status(404).json({ success: false, error: 'No Taxpayer Found for the Entered GSTIN/UIN.' });
        }

    } catch (err) {
        console.error("Search GSTIN Error:", err);
        res.status(500).json({ success: false, error: 'Unable to Fetch Taxpayer Details. Please Try Again.' });
    }
};

exports.searchByPAN = async (req, res) => {
    try {
        const { pan } = req.params;
        
        if (!pan || pan.length !== 10 || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
            return res.status(400).json({ success: false, error: 'Please enter a valid PAN.' });
        }

        // Try querying Supabase
        const { data, error } = await supabase
            .from('business_details')
            .select('*')
            .eq('pan', pan)
            .single();

        if (error) {
            // If table doesn't exist or column doesn't exist, fall back to mock
            if (error.code === '42P01' || error.code === '42703' || error.code === 'PGRST116') {
                const mockData = Object.values(mockTaxpayers).find(t => t.gstin.includes(pan));
                if (mockData) {
                    return res.status(200).json({ success: true, data: mockData });
                } else {
                    return res.status(404).json({ success: false, error: 'No taxpayer found for the entered PAN.' });
                }
            }
            throw error;
        }

        if (data) {
            // Map business_details fields to expected output
            const mappedData = {
                id: data.id,
                pan: data.pan || pan,
                gstin: data.gstin || 'N/A',
                legal_name: data.legal_name || 'N/A',
                trade_name: data.trade_name || 'N/A',
                taxpayer_type: data.taxpayer_type || (data.composition ? 'Composition' : 'Regular'),
                registration_date: data.commencement_date || data.liability_date || 'N/A',
                gst_status: 'Active', // Mocking status as Active for generic DB entries
                state: data.state_name || 'N/A',
                district: data.district || 'N/A',
                address: data.district ? `${data.district}, ${data.state_name}` : 'N/A'
            };
            return res.status(200).json({ success: true, data: mappedData });
        } else {
            return res.status(404).json({ success: false, error: 'No taxpayer found for the entered PAN.' });
        }

    } catch (err) {
        console.error("Search PAN Error:", err);
        res.status(500).json({ success: false, error: 'Unable to Fetch Taxpayer Details. Please Try Again.' });
    }
};

const mockTempIds = {
    'TMP123456789012': {
        id: 'tmp-1',
        temporary_id: 'TMP123456789012',
        applicant_name: 'Rahul Sharma',
        state: 'Maharashtra',
        mobile_number: '9876543210',
        application_type: 'New Registration',
        status: 'Pending for Processing',
        created_at: '2023-10-01T10:00:00Z'
    },
    'TMP098765432109': {
        id: 'tmp-2',
        temporary_id: 'TMP098765432109',
        applicant_name: 'Priya Patel',
        state: 'Gujarat',
        mobile_number: '8765432109',
        application_type: 'Amendment',
        status: 'Approved',
        created_at: '2023-09-15T14:30:00Z'
    }
};

exports.searchByTempID = async (req, res) => {
    try {
        const { temporaryId, state, mobileNumber } = req.body;

        if (!temporaryId && (!state || !mobileNumber)) {
            return res.status(400).json({ success: false, error: 'Please provide either Temporary ID or State and Mobile Number.' });
        }

        let query = supabase.from('taxpayer_temporary_ids').select('*');

        if (temporaryId) {
            query = query.eq('temporary_id', temporaryId);
        } else {
            query = query.eq('state', state).eq('mobile_number', mobileNumber);
        }

        const { data, error } = await query.single();

        if (error) {
            // Fallback logic
            if (error.code === '42P01' || error.code === 'PGRST116') {
                let mockData = null;
                if (temporaryId) {
                    mockData = mockTempIds[temporaryId.toUpperCase()];
                } else {
                    mockData = Object.values(mockTempIds).find(t => t.state === state && t.mobile_number === mobileNumber);
                }

                if (mockData) {
                    return res.status(200).json({ success: true, data: mockData });
                } else {
                    return res.status(404).json({ success: false, error: 'No record found for the entered details.' });
                }
            }
            throw error;
        }

        if (data) {
            const mappedData = {
                id: data.id,
                temporary_id: data.temporary_id,
                applicant_name: data.applicant_name || 'N/A',
                state: data.state || 'N/A',
                mobile_number: data.mobile_number || 'N/A',
                application_type: data.application_type || 'N/A',
                status: data.status || 'N/A',
                created_date: new Date(data.created_at).toLocaleDateString() || 'N/A'
            };
            return res.status(200).json({ success: true, data: mappedData });
        } else {
            return res.status(404).json({ success: false, error: 'No record found for the entered details.' });
        }

    } catch (err) {
        console.error("Search Temp ID Error:", err);
        res.status(500).json({ success: false, error: 'Unable to Fetch Temporary ID Details. Please Try Again.' });
    }
};

const mockCompositionTaxpayers = {
    '27COMP0000A1Z1': {
        id: 'comp-1',
        gstin: '27COMP0000A1Z1',
        legal_name: 'MAHARASHTRA TRADERS',
        trade_name: 'MAHARASHTRA TRADERS',
        state: 'Maharashtra',
        registration_date: '01/07/2017',
        composition_status: 'OPTED_IN',
        created_at: new Date().toISOString()
    },
    '27COMP0000A1Z2': {
        id: 'comp-2',
        gstin: '27COMP0000A1Z2',
        legal_name: 'PUNE ELECTRONICS',
        trade_name: 'PUNE ELECTRONICS',
        state: 'Maharashtra',
        registration_date: '15/08/2018',
        composition_status: 'OPTED_OUT',
        created_at: new Date().toISOString()
    },
    '07COMP0000B1Z1': {
        id: 'comp-3',
        gstin: '07COMP0000B1Z1',
        legal_name: 'DELHI WARES',
        trade_name: 'DELHI WARES',
        state: 'Delhi',
        registration_date: '10/01/2019',
        composition_status: 'OPTED_IN',
        created_at: new Date().toISOString()
    }
};

exports.searchComposition = async (req, res) => {
    try {
        const { searchType, gstin, state, optStatus } = req.body; // searchType: 'GSTIN' or 'State'

        if (!optStatus || (optStatus !== 'OPTED_IN' && optStatus !== 'OPTED_OUT')) {
            return res.status(400).json({ success: false, error: 'Please select a valid Opt In / Opt Out status.' });
        }

        if (searchType === 'GSTIN' && (!gstin || gstin.length !== 15)) {
            return res.status(400).json({ success: false, error: 'Please enter a valid 15-character GSTIN/UIN.' });
        }

        if (searchType === 'State' && !state) {
            return res.status(400).json({ success: false, error: 'Please select a State.' });
        }

        let query = supabase.from('composition_taxpayers').select('*').eq('composition_status', optStatus);

        if (searchType === 'GSTIN') {
            query = query.eq('gstin', gstin);
        } else {
            query = query.eq('state', state);
        }

        const { data, error } = await query;

        if (error) {
            // Fallback logic
            if (error.code === '42P01' || error.code === 'PGRST116') {
                let mockData = Object.values(mockCompositionTaxpayers).filter(t => t.composition_status === optStatus);
                if (searchType === 'GSTIN') {
                    mockData = mockData.filter(t => t.gstin === gstin.toUpperCase());
                } else {
                    mockData = mockData.filter(t => t.state === state);
                }

                if (mockData.length > 0) {
                    return res.status(200).json({ success: true, data: mockData });
                } else {
                    return res.status(404).json({ success: false, error: 'No Composition Taxpayer Records Found.' });
                }
            }
            throw error;
        }

        if (data && data.length > 0) {
            const mappedData = data.map(d => ({
                id: d.id,
                gstin: d.gstin,
                legal_name: d.legal_name || 'N/A',
                trade_name: d.trade_name || 'N/A',
                state: d.state || 'N/A',
                registration_date: d.registration_date || 'N/A',
                composition_status: d.composition_status
            }));
            return res.status(200).json({ success: true, data: mappedData });
        } else {
            return res.status(404).json({ success: false, error: 'No Composition Taxpayer Records Found.' });
        }

    } catch (err) {
        console.error("Search Composition Error:", err);
        res.status(500).json({ success: false, error: 'Unable to Fetch Details. Please Try Again.' });
    }
};
