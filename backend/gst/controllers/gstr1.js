const supabase = require('../config/supabase');

// Map table name to unique keys for manual upsert
const getUniqueKeys = (tableName) => {
    switch(tableName) {
        case 'gstr1_b2b_invoices': return ['trn', 'invoice_no'];
        case 'gstr1_b2cl_invoices': return ['trn', 'invoice_no'];
        case 'gstr1_exports_invoices': return ['trn', 'invoice_no'];
        case 'gstr1_b2cs_invoices': return ['trn', 'pos', 'rate'];
        case 'gstr1_nil_rated_supplies': return ['trn', 'description'];
        case 'gstr1_cdnr_invoices': return ['trn', 'note_number'];
        case 'gstr1_cdnur_invoices': return ['trn', 'note_number'];
        case 'gstr1_adv_tax': return ['trn', 'pos', 'rate'];
        case 'gstr1_adj_advances': return ['trn', 'pos', 'rate'];
        case 'gstr1_hsn_summary': return ['trn', 'hsn', 'rate', 'uqc', 'supply_type'];
        case 'gstr1_docs_issued': return ['trn', 'category', 'from_serial_no'];
        case 'gstr1_eco_supplies': return ['trn', 'eco_type', 'eco_gstin'];
        case 'gstr1_sup95': return ['trn', 'tab_type', 'document_number', 'pos', 'rate', 'supplier_gstin', 'recipient_gstin'];
        default: return ['id'];
    }
};

// Fetch Records
exports.getRecords = async (req, res) => {
    try {
        const { tableName, trn } = req.params;
        if (!tableName || !trn) {
            return res.status(400).json({ success: false, message: 'TableName and TRN required' });
        }

        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('trn', trn)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({ success: true, data: data || [] });
    } catch (error) {
        console.error(`Error fetching records for ${req.params.tableName}:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Save (Upsert) Record
exports.saveRecord = async (req, res) => {
    try {
        const { tableName } = req.params;
        const payload = req.body;

        if (!tableName || !payload || !payload.trn) {
            return res.status(400).json({ success: false, message: 'TableName and Payload with TRN required' });
        }

        let existingRecord = null;
        if (payload.id) {
            // Check by ID if provided (Editing)
            const { data } = await supabase.from(tableName).select('id').eq('id', payload.id).single();
            if (data) existingRecord = data;
        }

        let result;
        payload.updated_at = new Date().toISOString();

        if (existingRecord) {
            // Update
            const { data, error } = await supabase
                .from(tableName)
                .update(payload)
                .eq('id', existingRecord.id)
                .select();
            if (error) throw error;
            result = data;
        } else {
            // Insert
            const { data, error } = await supabase
                .from(tableName)
                .insert([payload])
                .select();
            if (error) {
                const errStr = typeof error === 'string' ? error : JSON.stringify(error) + ' ' + (error.message || '') + ' ' + (error.details || '');
                if (errStr.includes('23505') || errStr.toLowerCase().includes('duplicate key') || errStr.toLowerCase().includes('unique constraint')) {
                    return res.status(400).json({ success: false, message: 'This Invoice Number / Document Number already exists for your TRN. Please use a unique number to add a new record.' });
                }
                throw error;
            }
            result = data;
        }

        res.status(200).json({ success: true, data: result[0] });
    } catch (error) {
        // Log full error details for debugging
        console.error(`Error saving record for ${req.params.tableName}:`, error);
        const errorMsg = error.message || 'Unknown error';
        const errorDetails = error.details || '';
        res.status(500).json({ success: false, message: errorMsg, details: errorDetails });
    }
};

// Delete Record
exports.deleteRecord = async (req, res) => {
    try {
        const { tableName, id } = req.params;
        if (!tableName || !id) {
            return res.status(400).json({ success: false, message: 'TableName and ID required' });
        }

        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        console.error(`Error deleting record from ${req.params.tableName}:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Summary Counts
exports.getCounts = async (req, res) => {
    try {
        const { trn } = req.params;
        if (!trn) {
            return res.status(400).json({ success: false, message: 'TRN required' });
        }

        const tables = [
            { key: 'b2b', name: 'gstr1_b2b_invoices' },
            { key: 'b2cl', name: 'gstr1_b2cl_invoices' },
            { key: 'exports', name: 'gstr1_exports_invoices' },
            { key: 'b2cs', name: 'gstr1_b2cs_invoices' },
            { key: 'nilRated', name: 'gstr1_nil_rated_supplies' },
            { key: 'cdnr', name: 'gstr1_cdnr_invoices' },
            { key: 'cdnur', name: 'gstr1_cdnur_invoices' },
            { key: 'advTax', name: 'gstr1_adv_tax' },
            { key: 'adjAdvances', name: 'gstr1_adj_advances' },
            { key: 'hsn', name: 'gstr1_hsn_summary' },
            { key: 'documents', name: 'gstr1_docs_issued' },
            { key: 'eco', name: 'gstr1_eco_supplies' },
            { key: 'sup95', name: 'gstr1_sup95' }
        ];

        const counts = {};

        // Execute all count queries in parallel
        await Promise.all(tables.map(async (table) => {
            const { count, error } = await supabase
                .from(table.name)
                .select('*', { count: 'exact', head: true })
                .eq('trn', trn);
            
            if (!error) {
                counts[table.key] = count || 0;
            } else {
                counts[table.key] = 0;
                console.error(`Count error for ${table.name}:`, error.message);
            }
        }));

        res.status(200).json({ success: true, data: counts });
    } catch (error) {
        console.error('Error fetching GSTR-1 counts:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reset all GSTR-1 data for a specific user TRN
exports.resetRecords = async (req, res) => {
    try {
        const { trn } = req.params;
        if (!trn) {
            return res.status(400).json({ success: false, message: 'TRN required' });
        }

        const tables = [
            'gstr1_b2b_invoices',
            'gstr1_b2cl_invoices',
            'gstr1_exports_invoices',
            'gstr1_b2cs_invoices',
            'gstr1_nil_rated_supplies',
            'gstr1_cdnr_invoices',
            'gstr1_cdnur_invoices',
            'gstr1_adv_tax',
            'gstr1_adj_advances',
            'gstr1_hsn_summary',
            'gstr1_docs_issued',
            'gstr1_eco_supplies',
            'gstr1_sup95'
        ];

        // Execute all deletes in parallel
        await Promise.all(tables.map(async (table) => {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('trn', trn);
            
            if (error) {
                console.error(`Reset error for ${table}:`, error.message);
                throw error;
            }
        }));

        res.status(200).json({ success: true, message: 'GSTR-1 data reset successfully' });
    } catch (error) {
        console.error('Error resetting GSTR-1 records:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
