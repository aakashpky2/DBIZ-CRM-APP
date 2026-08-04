const supabase = require('../config/supabase');
const ExcelJS = require('exceljs');

const mockData = [
    { cause_number: 'C-2023-001', case_reference: 'REF-001', authority_type: 'Central Tax', jurisdiction: 'Jurisdiction A', state: 'Maharashtra', hearing_date: new Date().toISOString().split('T')[0], hearing_time: '10:30 AM', taxpayer_name: 'Reliance Industries Ltd.', gstin: '27AAAAA0000A1Z5', case_subject: 'Appeal against tax demand', case_status: 'Scheduled', venue: 'Room 101, Central Tax Office, Mumbai', remarks: 'Bring all original documents.' },
    { cause_number: 'C-2023-002', case_reference: 'REF-002', authority_type: 'State Tax', jurisdiction: 'Jurisdiction B', state: 'Delhi', hearing_date: new Date().toISOString().split('T')[0], hearing_time: '02:00 PM', taxpayer_name: 'Tata Motors', gstin: '07BBBBB0000B1Z6', case_subject: 'Dispute regarding input tax credit', case_status: 'Adjourned', venue: 'Room 202, State Tax Office, Delhi', remarks: 'Next hearing date to be notified.' },
    { cause_number: 'C-2023-003', case_reference: 'REF-003', authority_type: 'Appellate Authority', jurisdiction: 'Jurisdiction C', state: 'Maharashtra', hearing_date: new Date().toISOString().split('T')[0], hearing_time: '11:00 AM', taxpayer_name: 'Infosys Ltd.', gstin: '29CCCCC0000C1Z7', case_subject: 'Appeal for refund rejection', case_status: 'Scheduled', venue: 'Appellate Tribunal, Mumbai', remarks: 'Personal appearance required.' }
];

exports.searchCauseList = async (req, res) => {
    try {
        const { authority_type, state, jurisdiction, date } = req.body;

        if (!authority_type || !state) {
            return res.status(400).json({ success: false, error: 'Type of Authority and State are mandatory fields.' });
        }

        let dbQuery = supabase.from('cause_list').select('*');

        dbQuery = dbQuery.eq('authority_type', authority_type);
        dbQuery = dbQuery.eq('state', state);

        if (jurisdiction) {
            dbQuery = dbQuery.eq('jurisdiction', jurisdiction);
        }

        if (date) {
            dbQuery = dbQuery.eq('hearing_date', date);
        }

        const { data, error } = await dbQuery;

        if (error) {
            if (error.code === '42P01') {
                console.warn("Table cause_list does not exist. Using mock data.");
                let results = mockData.filter(item => item.authority_type === authority_type && item.state === state);
                
                if (jurisdiction) {
                    results = results.filter(item => item.jurisdiction === jurisdiction);
                }
                if (date) {
                    results = results.filter(item => item.hearing_date === date);
                }
                
                return res.status(200).json({ success: true, data: results });
            }
            throw error;
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Error in searchCauseList:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.downloadCauseListExcel = async (req, res) => {
    try {
        const { authority_type, state, jurisdiction, date } = req.query;

        let dbQuery = supabase.from('cause_list').select('*');

        if (authority_type) dbQuery = dbQuery.eq('authority_type', authority_type);
        if (state) dbQuery = dbQuery.eq('state', state);
        if (jurisdiction) dbQuery = dbQuery.eq('jurisdiction', jurisdiction);
        if (date) dbQuery = dbQuery.eq('hearing_date', date);

        const { data, error } = await dbQuery;

        let records = data;

        if (error) {
            if (error.code === '42P01') {
                console.warn("Table cause_list does not exist. Using mock data for Excel.");
                records = mockData;
                if (authority_type) records = records.filter(item => item.authority_type === authority_type);
                if (state) records = records.filter(item => item.state === state);
                if (jurisdiction) records = records.filter(item => item.jurisdiction === jurisdiction);
                if (date) records = records.filter(item => item.hearing_date === date);
            } else {
                throw error;
            }
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Cause List');

        worksheet.columns = [
            { header: 'Cause Number', key: 'cause_number', width: 20 },
            { header: 'Case Reference', key: 'case_reference', width: 20 },
            { header: 'GSTIN', key: 'gstin', width: 20 },
            { header: 'Taxpayer Name', key: 'taxpayer_name', width: 30 },
            { header: 'Authority Type', key: 'authority_type', width: 20 },
            { header: 'Jurisdiction', key: 'jurisdiction', width: 20 },
            { header: 'State', key: 'state', width: 20 },
            { header: 'Hearing Date', key: 'hearing_date', width: 15 },
            { header: 'Hearing Time', key: 'hearing_time', width: 15 },
            { header: 'Case Subject', key: 'case_subject', width: 30 },
            { header: 'Case Status', key: 'case_status', width: 15 },
            { header: 'Venue', key: 'venue', width: 40 }
        ];

        worksheet.getRow(1).font = { bold: true };

        if (records) {
            records.forEach(record => {
                worksheet.addRow(record);
            });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'Cause_List.xlsx');

        await workbook.xlsx.write(res);
        res.status(200).end();
    } catch (err) {
        console.error('Error in downloadCauseListExcel:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
