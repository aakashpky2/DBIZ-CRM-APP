const supabase = require('../config/supabase');

const mockData = [
    { rfn_number: 'RFN-2023-VALID-01', document_type: 'Notice', document_title: 'Show Cause Notice for Tax Demand', issued_by: 'State Tax', officer_name: 'Rajesh Kumar', officer_designation: 'Assistant Commissioner', state: 'Maharashtra', gstin: '27AAAAA0000A1Z5', taxpayer_name: 'Reliance Industries Ltd.', issue_date: '2023-01-15', validity_date: '2023-12-31', document_status: 'Valid', remarks: 'Respond within 30 days.' },
    { rfn_number: 'RFN-2023-EXPIR-02', document_type: 'Order', document_title: 'Order for Cancellation of Registration', issued_by: 'Central Tax', officer_name: 'Amit Singh', officer_designation: 'Joint Commissioner', state: 'Delhi', gstin: '07BBBBB0000B1Z6', taxpayer_name: 'Tata Motors', issue_date: '2022-05-10', validity_date: '2022-11-10', document_status: 'Expired', remarks: 'Validity period has ended.' },
    { rfn_number: 'RFN-2023-CANCE-03', document_type: 'Certificate', document_title: 'Registration Certificate', issued_by: 'State Tax', officer_name: 'Priya Sharma', officer_designation: 'Superintendent', state: 'Karnataka', gstin: '29CCCCC0000C1Z7', taxpayer_name: 'Infosys Ltd.', issue_date: '2023-02-20', validity_date: '2024-02-20', document_status: 'Cancelled', remarks: 'Cancelled due to taxpayer request.' },
    { rfn_number: 'RFN-2023-REVOK-04', document_type: 'Notice', document_title: 'Notice for Non-filing of Returns', issued_by: 'Integrated Tax', officer_name: 'Vikram Patel', officer_designation: 'Deputy Commissioner', state: 'Gujarat', gstin: '24DDDDD0000D1Z8', taxpayer_name: 'Adani Enterprises', issue_date: '2023-03-01', validity_date: null, document_status: 'Revoked', remarks: 'Notice revoked after compliance.' },
    { rfn_number: 'RFN-2023-REVIE-05', document_type: 'Summons', document_title: 'Summons to Appear', issued_by: 'State Tax', officer_name: 'Neha Gupta', officer_designation: 'Assistant Commissioner', state: 'Tamil Nadu', gstin: '33EEEEE0000E1Z9', taxpayer_name: 'TVS Motor Company', issue_date: '2023-04-10', validity_date: null, document_status: 'Under Review', remarks: 'Pending further investigation.' }
];

exports.verifyRfn = async (req, res) => {
    try {
        const { rfn_number } = req.body;

        if (!rfn_number) {
            return res.status(400).json({ success: false, error: 'Please enter Reference Number (RFN).' });
        }

        const { data, error } = await supabase
            .from('rfn_documents')
            .select('*')
            .eq('rfn_number', rfn_number)
            .single();

        if (error) {
            if (error.code === '42P01') {
                console.warn("Table rfn_documents does not exist. Using mock data.");
                const result = mockData.find(item => item.rfn_number === rfn_number);
                if (result) {
                    return res.status(200).json({ success: true, data: result });
                } else {
                    return res.status(404).json({ success: false, error: 'No document found for the entered RFN.' });
                }
            }
            if (error.code === 'PGRST116') { // No rows returned
                 return res.status(404).json({ success: false, error: 'No document found for the entered RFN.' });
            }
            throw error;
        }

        if (data) {
            res.status(200).json({ success: true, data });
        } else {
            res.status(404).json({ success: false, error: 'No document found for the entered RFN.' });
        }
    } catch (err) {
        console.error('Error in verifyRfn:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
