const gstr2aService = require('../services/gstr2aService');

// GET /api/gstr2a/summary/:trn
exports.getGSTR2ASummary = async (req, res) => {
    try {
        const { trn } = req.params;
        if (!trn) return res.status(400).json({ success: false, error: 'TRN is required' });
        const result = await gstr2aService.getGSTR2ASummary(trn);
        res.status(result.success ? 200 : 500).json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/gstr2a/b2b/:trn
exports.getB2BInvoices = async (req, res) => {
    try {
        const { trn } = req.params;
        const supabase = require('../config/supabase');
        const { data, error } = await supabase
            .from('gstr2a_b2b_invoices')
            .select('*')
            .eq('receiver_trn', trn)
            .eq('status', 'ACTIVE')
            .order('created_at', { ascending: false });
        if (error) return res.status(500).json({ success: false, error: error.message });
        res.status(200).json({ success: true, data: data || [] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/gstr2a/cdnr/:trn
exports.getCDNRNotes = async (req, res) => {
    try {
        const { trn } = req.params;
        const supabase = require('../config/supabase');
        const { data, error } = await supabase
            .from('gstr2a_credit_debit_notes')
            .select('*')
            .eq('receiver_trn', trn)
            .eq('status', 'ACTIVE')
            .order('created_at', { ascending: false });
        if (error) return res.status(500).json({ success: false, error: error.message });
        res.status(200).json({ success: true, data: data || [] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/gstr2a/amended/:trn
exports.getAmendedInvoices = async (req, res) => {
    try {
        const { trn } = req.params;
        const supabase = require('../config/supabase');
        const { data, error } = await supabase
            .from('gstr2a_amended_invoices')
            .select('*')
            .eq('receiver_trn', trn)
            .eq('status', 'ACTIVE')
            .order('created_at', { ascending: false });
        if (error) return res.status(500).json({ success: false, error: error.message });
        res.status(200).json({ success: true, data: data || [] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/gstr2a/itc/:trn
exports.getITCSummary = async (req, res) => {
    try {
        const { trn } = req.params;
        const result = await gstr2aService.calculateITCSummary(trn);
        res.status(result.success ? 200 : 500).json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
