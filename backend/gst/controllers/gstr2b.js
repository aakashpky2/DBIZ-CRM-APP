const gstr2aService = require('../services/gstr2aService');
const supabase = require('../config/supabase');

// GET /api/gstr2b/:trn
exports.getGSTR2BData = async (req, res) => {
    try {
        const { trn } = req.params;
        const { month, year } = req.query;
        if (!trn) return res.status(400).json({ success: false, error: 'TRN is required' });
        const result = await gstr2aService.getGSTR2BData(trn, month ? parseInt(month) : null, year ? parseInt(year) : null);
        res.status(result.success ? 200 : 500).json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/gstr2b/generate
exports.generateGSTR2B = async (req, res) => {
    try {
        const { trn, month, year } = req.body;
        if (!trn || !month || !year) {
            return res.status(400).json({ success: false, error: 'TRN, month, and year are required' });
        }
        const result = await gstr2aService.generateGSTR2BFromGSTR2A(trn, parseInt(month), parseInt(year));
        res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/gstr2b/snapshots/:trn
exports.getSnapshots = async (req, res) => {
    try {
        const { trn } = req.params;
        const { data, error } = await supabase
            .from('gstr2b_snapshots')
            .select('*')
            .eq('receiver_trn', trn)
            .order('snapshot_year', { ascending: false })
            .order('snapshot_month', { ascending: false });
        if (error) return res.status(500).json({ success: false, error: error.message });
        res.status(200).json({ success: true, data: data || [] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/gstr2b/summary/:trn
exports.getGSTR2BDashboardSummary = async (req, res) => {
    try {
        const { trn } = req.params;
        if (!trn) return res.status(400).json({ success: false, error: 'TRN is required' });

        // Fetch GSTR-1 outward records for the TRN to simulate inward GSTR-2B
        const [b2bRes, cdnrRes, cdnurRes, expRes, amendedRes] = await Promise.all([
            supabase.from('gstr1_b2b_invoices').select('*').eq('trn', trn),
            supabase.from('gstr1_cdnr_invoices').select('*').eq('trn', trn),
            supabase.from('gstr1_cdnur_invoices').select('*').eq('trn', trn),
            supabase.from('gstr1_exports_invoices').select('*').eq('trn', trn),
            supabase.from('gstr1_b2ba_invoices').select('*').eq('trn', trn).limit(0) // Dummy if doesn't exist
        ]);

        const b2b = b2bRes.data || [];
        const cdnr = cdnrRes.data || [];
        const cdnur = cdnurRes.data || [];
        const exportsList = expRes.data || [];
        const amended = amendedRes.data || [];

        // Separate reverse charge from B2B
        const revCharge = b2b.filter(r => r.reverseCharge === 'Y');
        const regularB2B = b2b.filter(r => r.reverseCharge !== 'Y');
        
        // SEZ exports
        const sez = exportsList.filter(r => ['SEZWP', 'SEZWOP'].includes(r.exportType || r.expType));

        const sumData = (records) => {
            let count = records.length;
            let taxableValue = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
            records.forEach(r => {
                const items = r.items || r.itemDetails || r.taxItems || r.tax_items || [];
                if (items.length > 0) {
                    items.forEach(item => {
                        taxableValue += parseFloat(item.taxableValue || item.taxable_value || 0);
                        igst += parseFloat(item.integratedTax || item.igst || 0);
                        cgst += parseFloat(item.centralTax || item.cgst || 0);
                        sgst += parseFloat(item.stateTax || item.sgst || 0);
                        cess += parseFloat(item.cess || 0);
                    });
                } else {
                    taxableValue += parseFloat(r.taxableValue || r.taxable_value || r.totalInvoiceValue || 0);
                    igst += parseFloat(r.igst || r.integratedTax || 0);
                    cgst += parseFloat(r.cgst || r.centralTax || 0);
                    sgst += parseFloat(r.sgst || r.stateTax || 0);
                    cess += parseFloat(r.cess || 0);
                }
            });
            return { count, taxableValue, igst, cgst, sgst, cess, totalItc: igst + cgst + sgst + cess };
        };

        const emptySum = { count: 0, taxableValue: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, totalItc: 0 };

        const sums = {
            registered: sumData(regularB2B),
            isd: emptySum,
            revCharge: sumData(revCharge),
            importGoods: emptySum,
            sez: sumData(sez),
            cdnr: sumData([...cdnr, ...cdnur]),
            amendments: sumData(amended)
        };

        // valid / invalid split for ITC Available / Not Available
        // Simplification for the exercise: 
        // B2B, CDNR, SEZ are eligible (Available)
        // Others (exempt, nil rated etc if we had them) would be Ineligible
        const itcAvailableSum = sumData([...regularB2B, ...sez, ...cdnr, ...cdnur]);
        const itcNotAvailableSum = emptySum; 
        const allOtherItc = sumData([...regularB2B, ...sez]);

        res.status(200).json({
            success: true,
            data: {
                boxes: {
                    allOtherItc,
                    registered: sums.registered,
                    isd: sums.isd,
                    revCharge: sums.revCharge,
                    importGoods: sums.importGoods,
                    sez: sums.sez,
                    cdnr: sums.cdnr,
                    amendments: sums.amendments,
                    itcNotAvailable: itcNotAvailableSum,
                    itcAvailable: itcAvailableSum
                },
                rawRecords: {
                    registered: regularB2B,
                    isd: [],
                    revCharge: revCharge,
                    importGoods: [],
                    sez: sez,
                    cdnr: [...cdnr, ...cdnur],
                    amendments: amended
                }
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
