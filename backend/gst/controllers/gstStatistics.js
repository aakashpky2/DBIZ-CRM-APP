const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

let mockStatistics = [
    { id: uuidv4(), financial_year: '2017-2018', registration_file: '#', gstr3b_file: '#', gstr1_file: '#', gross_net_collection_file: '#', state_wise_collection_file: '#', igst_settlement_file: null, eway_bill_file: '#' },
    { id: uuidv4(), financial_year: '2018-2019', registration_file: '#', gstr3b_file: '#', gstr1_file: '#', gross_net_collection_file: '#', state_wise_collection_file: '#', igst_settlement_file: '#', eway_bill_file: '#' },
    { id: uuidv4(), financial_year: '2019-2020', registration_file: '#', gstr3b_file: '#', gstr1_file: '#', gross_net_collection_file: '#', state_wise_collection_file: '#', igst_settlement_file: '#', eway_bill_file: '#' },
    { id: uuidv4(), financial_year: '2020-2021', registration_file: '#', gstr3b_file: '#', gstr1_file: '#', gross_net_collection_file: '#', state_wise_collection_file: '#', igst_settlement_file: '#', eway_bill_file: '#' },
    { id: uuidv4(), financial_year: '2021-2022', registration_file: '#', gstr3b_file: '#', gstr1_file: '#', gross_net_collection_file: '#', state_wise_collection_file: '#', igst_settlement_file: '#', eway_bill_file: '#' },
    { id: uuidv4(), financial_year: '2022-2023', registration_file: '#', gstr3b_file: '#', gstr1_file: '#', gross_net_collection_file: '#', state_wise_collection_file: '#', igst_settlement_file: '#', eway_bill_file: '#' },
    { id: uuidv4(), financial_year: '2023-2024', registration_file: '#', gstr3b_file: '#', gstr1_file: '#', gross_net_collection_file: '#', state_wise_collection_file: '#', igst_settlement_file: '#', eway_bill_file: '#' },
    { id: uuidv4(), financial_year: '2024-2025', registration_file: '#', gstr3b_file: '#', gstr1_file: '#', gross_net_collection_file: '#', state_wise_collection_file: '#', igst_settlement_file: '#', eway_bill_file: '#' },
    { id: uuidv4(), financial_year: '2025-2026', registration_file: '#', gstr3b_file: '#', gstr1_file: '#', gross_net_collection_file: '#', state_wise_collection_file: '#', igst_settlement_file: '#', eway_bill_file: '#' }
];

let mockReports = [
    { id: uuidv4(), report_name: 'Yearwise Pre-GST regime revenue from taxes subsumed in GST', report_file: '#' },
    { id: uuidv4(), report_name: 'Statistical Report on 8 Years of GST', report_file: '#' }
];

exports.getAllStatistics = async (req, res) => {
    try {
        const { data, error } = await supabase.from('gst_statistics').select('*').order('financial_year', { ascending: true });
        if (error) {
            if (error.code === '42P01') { // Table does not exist
                return res.status(200).json({ success: true, data: mockStatistics });
            }
            throw error;
        }
        res.status(200).json({ success: true, data: data.length ? data : mockStatistics });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.addOrUpdateStatistic = async (req, res) => {
    try {
        const { financial_year, ...updates } = req.body;
        
        // Try update first
        const { data: existingData, error: fetchError } = await supabase.from('gst_statistics').select('*').eq('financial_year', financial_year);
        
        if (fetchError && fetchError.code === '42P01') {
            // Mock fallback
            const existingIndex = mockStatistics.findIndex(s => s.financial_year === financial_year);
            if (existingIndex > -1) {
                mockStatistics[existingIndex] = { ...mockStatistics[existingIndex], ...updates };
                return res.status(200).json({ success: true, data: [mockStatistics[existingIndex]] });
            } else {
                const newStat = { id: uuidv4(), financial_year, ...updates };
                mockStatistics.push(newStat);
                mockStatistics.sort((a,b) => a.financial_year.localeCompare(b.financial_year));
                return res.status(201).json({ success: true, data: [newStat] });
            }
        }
        
        if (existingData && existingData.length > 0) {
            const { data, error } = await supabase.from('gst_statistics').update(updates).eq('financial_year', financial_year).select();
            if (error) throw error;
            return res.status(200).json({ success: true, data });
        } else {
            const { data, error } = await supabase.from('gst_statistics').insert([{ financial_year, ...updates }]).select();
            if (error) throw error;
            return res.status(201).json({ success: true, data });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.deleteStatistic = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('gst_statistics').delete().eq('id', id);
        if (error) {
            if (error.code === '42P01') {
                mockStatistics = mockStatistics.filter(s => s.id !== id);
                return res.status(200).json({ success: true });
            }
            throw error;
        }
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getAllReports = async (req, res) => {
    try {
        const { data, error } = await supabase.from('gst_statistics_reports').select('*');
        if (error) {
            if (error.code === '42P01') {
                return res.status(200).json({ success: true, data: mockReports });
            }
            throw error;
        }
        res.status(200).json({ success: true, data: data.length ? data : mockReports });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.addReport = async (req, res) => {
    try {
        const { report_name, report_file } = req.body;
        const { data, error } = await supabase.from('gst_statistics_reports').insert([{ report_name, report_file }]).select();
        if (error) {
            if (error.code === '42P01') {
                const newReport = { id: uuidv4(), report_name, report_file };
                mockReports.push(newReport);
                return res.status(201).json({ success: true, data: [newReport] });
            }
            throw error;
        }
        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('gst_statistics_reports').delete().eq('id', id);
        if (error) {
            if (error.code === '42P01') {
                mockReports = mockReports.filter(r => r.id !== id);
                return res.status(200).json({ success: true });
            }
            throw error;
        }
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
