const supabase = require('../config/supabase');

// ─────────────────────────────────────────────────────────────
// HELPER: Fetch Supplier Info
// ─────────────────────────────────────────────────────────────
async function getSupplierInfo(supplierTrn) {
    const { data } = await supabase
        .from('business_details')
        .select('legal_name, pan, trn')
        .eq('trn', supplierTrn)
        .single();
    return {
        supplierName: data?.legal_name || 'Unknown Supplier',
        supplierGstin: data?.pan || supplierTrn,
    };
}

// ─────────────────────────────────────────────────────────────
// HELPER: Find Receiver TRN by GSTIN
// ─────────────────────────────────────────────────────────────
async function getReceiverByGstin(gstin) {
    if (!gstin) return null;
    const { data } = await supabase
        .from('business_details')
        .select('trn, pan, legal_name')
        .or(`pan.eq.${gstin},pan.ilike.${gstin}`)
        .limit(1);
    return data && data.length > 0 ? data[0] : null;
}

// ─────────────────────────────────────────────────────────────
// HELPER: Calculate item totals
// ─────────────────────────────────────────────────────────────
function calcItemTotals(inv) {
    let taxableValue = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
    const items = inv.itemDetails || inv.items || inv.taxItems || inv.tax_items || [];
    if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
            taxableValue += parseFloat(item.taxableValue || item.taxable_value) || 0;
            igst += parseFloat(item.igst || item.integratedTax) || 0;
            cgst += parseFloat(item.cgst || item.centralTax) || 0;
            sgst += parseFloat(item.sgst || item.stateTax) || 0;
            cess += parseFloat(item.cess) || 0;
        }
    } else {
        // Fallback to invoice-level values
        taxableValue = parseFloat(inv.taxableValue || inv.taxable_value || inv.totalInvoiceValue) || 0;
        igst = parseFloat(inv.igst || inv.integratedTax) || 0;
        cgst = parseFloat(inv.cgst || inv.centralTax) || 0;
        sgst = parseFloat(inv.sgst || inv.stateTax) || 0;
        cess = parseFloat(inv.cess) || 0;
    }
    return {
        taxable_value: taxableValue,
        igst, cgst, sgst, cess,
        total_tax: igst + cgst + sgst + cess
    };
}

// ─────────────────────────────────────────────────────────────
// PHASE 2: Generate GSTR-2A from GSTR-1
// ─────────────────────────────────────────────────────────────

/**
 * Main auto-generate GSTR-2A from a GSTR-1 save action.
 * 
 * @param {Array} invoices - Invoices from GSTR-1
 * @param {String} sectionName - 'GSTR1_B2B_Invoices' | 'GSTR1_CDNR_Invoices' | 'GSTR1_B2BA_Invoices' | 'GSTR1_CDNRA_Invoices'
 * @param {String} supplierTrn - Supplier's TRN
 */
exports.generateGSTR2AFromGSTR1 = async (invoices, sectionName, supplierTrn) => {
    try {
        if (!invoices || invoices.length === 0) return;

        const { supplierName, supplierGstin } = await getSupplierInfo(supplierTrn);
        const returnPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

        for (const inv of invoices) {
            // Get receiver GSTIN from the invoice
            const receiverGstin = inv.recipientGSTIN || inv.recipientGstin || inv.receiver_gstin;
            if (!receiverGstin) continue;

            // Lookup receiver in business_details
            const receiverInfo = await getReceiverByGstin(receiverGstin);
            if (!receiverInfo) {
                console.log(`[GSTR2A] Receiver GSTIN ${receiverGstin} not in system. Skipping.`);
                continue;
            }

            const receiverTrn = receiverInfo.trn;
            const totals = calcItemTotals(inv);
            const now = new Date().toISOString();

            if (sectionName === 'GSTR1_B2B_Invoices') {
                const record = {
                    supplier_trn: supplierTrn,
                    receiver_trn: receiverTrn,
                    supplier_gstin: supplierGstin,
                    receiver_gstin: receiverGstin,
                    supplier_name: supplierName,
                    invoice_number: inv.invoiceNo,
                    invoice_date: inv.invoiceDate,
                    ...totals,
                    place_of_supply: inv.pos,
                    return_period: inv.returnPeriod || returnPeriod,
                    source_section: 'B2B',
                    source_gstr1_id: `${supplierTrn}_B2B_${inv.invoiceNo}`,
                    status: 'ACTIVE',
                    itc_eligible: true,
                    updated_at: now
                };
                const { error } = await supabase
                    .from('gstr2a_b2b_invoices')
                    .upsert(record, { onConflict: 'receiver_gstin,source_gstr1_id' });
                if (error) console.error('[GSTR2A] B2B upsert error:', error.message);
                else console.log(`[GSTR2A] B2B record saved for ${receiverGstin}: INV ${inv.invoiceNo}`);

            } else if (sectionName === 'GSTR1_CDNR_Invoices') {
                const noteType = inv.noteType || 'Credit';
                const record = {
                    supplier_trn: supplierTrn,
                    receiver_trn: receiverTrn,
                    supplier_gstin: supplierGstin,
                    receiver_gstin: receiverGstin,
                    supplier_name: supplierName,
                    note_number: inv.noteNumber || inv.noteNo,
                    note_date: inv.noteDate,
                    note_type: noteType,
                    ...totals,
                    place_of_supply: inv.pos,
                    return_period: inv.returnPeriod || returnPeriod,
                    source_section: 'CDNR',
                    source_gstr1_id: `${supplierTrn}_CDNR_${inv.noteNumber || inv.noteNo}`,
                    status: 'ACTIVE',
                    itc_eligible: true,
                    updated_at: now
                };
                const { error } = await supabase
                    .from('gstr2a_credit_debit_notes')
                    .upsert(record, { onConflict: 'receiver_gstin,source_gstr1_id' });
                if (error) console.error('[GSTR2A] CDNR upsert error:', error.message);

            } else if (sectionName === 'GSTR1_B2BA_Invoices') {
                const record = {
                    supplier_trn: supplierTrn,
                    receiver_trn: receiverTrn,
                    supplier_gstin: supplierGstin,
                    receiver_gstin: receiverGstin,
                    supplier_name: supplierName,
                    invoice_number: inv.revisedInvoiceNo || inv.invoiceNo,
                    invoice_date: inv.revisedInvoiceDate || inv.invoiceDate,
                    ...totals,
                    place_of_supply: inv.pos,
                    return_period: inv.returnPeriod || returnPeriod,
                    source_section: 'B2BA',
                    source_gstr1_id: `${supplierTrn}_B2BA_${inv.revisedInvoiceNo || inv.invoiceNo}`,
                    status: 'ACTIVE',
                    itc_eligible: true,
                    updated_at: now
                };
                const { error } = await supabase
                    .from('gstr2a_amended_invoices')
                    .upsert(record, { onConflict: 'receiver_gstin,source_gstr1_id' });
                if (error) console.error('[GSTR2A] B2BA upsert error:', error.message);

            } else if (sectionName === 'GSTR1_CDNRA_Invoices') {
                const record = {
                    supplier_trn: supplierTrn,
                    receiver_trn: receiverTrn,
                    supplier_gstin: supplierGstin,
                    receiver_gstin: receiverGstin,
                    supplier_name: supplierName,
                    invoice_number: inv.revisedNoteNo || inv.noteNo,
                    invoice_date: inv.revisedNoteDate || inv.noteDate,
                    ...totals,
                    place_of_supply: inv.pos,
                    return_period: inv.returnPeriod || returnPeriod,
                    source_section: 'CDNRA',
                    source_gstr1_id: `${supplierTrn}_CDNRA_${inv.revisedNoteNo || inv.noteNo}`,
                    status: 'ACTIVE',
                    itc_eligible: true,
                    updated_at: now
                };
                const { error } = await supabase
                    .from('gstr2a_amended_invoices')
                    .upsert(record, { onConflict: 'receiver_gstin,source_gstr1_id' });
                if (error) console.error('[GSTR2A] CDNRA upsert error:', error.message);
            }
        }
    } catch (err) {
        console.error('[GSTR2A] Auto-generation failed:', err.message);
    }
};

// ─────────────────────────────────────────────────────────────
// PHASE 3: Generate GSTR-2B Snapshot from GSTR-2A
// ─────────────────────────────────────────────────────────────

/**
 * Generate a locked monthly GSTR-2B snapshot from live GSTR-2A data.
 * Prevents duplicate generation for same month+year.
 * 
 * @param {String} receiverTrn - The receiver's TRN
 * @param {Integer} month - 1-12
 * @param {Integer} year - e.g. 2026
 */
exports.generateGSTR2BFromGSTR2A = async (receiverTrn, month, year) => {
    try {
        // Step 1: Check if snapshot already exists
        const { data: existingSnapshot } = await supabase
            .from('gstr2b_snapshots')
            .select('id')
            .eq('receiver_trn', receiverTrn)
            .eq('snapshot_month', month)
            .eq('snapshot_year', year)
            .single();

        if (existingSnapshot) {
            return {
                success: false,
                message: `GSTR-2B for ${getMonthName(month)} ${year} already exists. Cannot generate again.`
            };
        }

        // Step 2: Fetch receiver GSTIN
        const { data: receiverData } = await supabase
            .from('business_details')
            .select('pan, legal_name')
            .eq('trn', receiverTrn)
            .single();

        if (!receiverData) {
            return { success: false, message: 'Receiver not found.' };
        }

        const receiverGstin = receiverData.pan;
        const generatedAt = new Date().toISOString();
        const snapshotMonth = month;
        const snapshotYear = year;

        // Step 3: Create snapshot metadata record first
        const { data: snapshot, error: snapErr } = await supabase
            .from('gstr2b_snapshots')
            .insert({
                receiver_trn: receiverTrn,
                receiver_gstin: receiverGstin,
                snapshot_month: snapshotMonth,
                snapshot_year: snapshotYear,
                generated_at: generatedAt,
                status: 'GENERATED'
            })
            .select()
            .single();

        if (snapErr) throw new Error('Failed to create snapshot: ' + snapErr.message);
        const snapshotId = snapshot.id;

        let totalTaxableValue = 0, totalIgst = 0, totalCgst = 0, totalSgst = 0, totalCess = 0;

        // Step 4: Copy GSTR-2A B2B records → GSTR-2B B2B
        const { data: b2bRecords } = await supabase
            .from('gstr2a_b2b_invoices')
            .select('*')
            .eq('receiver_trn', receiverTrn)
            .eq('status', 'ACTIVE');

        if (b2bRecords && b2bRecords.length > 0) {
            const b2bSnapshotRecords = b2bRecords.map(r => ({
                snapshot_id: snapshotId,
                supplier_trn: r.supplier_trn,
                receiver_trn: r.receiver_trn,
                supplier_gstin: r.supplier_gstin,
                receiver_gstin: r.receiver_gstin,
                supplier_name: r.supplier_name,
                invoice_number: r.invoice_number,
                invoice_date: r.invoice_date,
                taxable_value: r.taxable_value,
                rate: r.rate,
                igst: r.igst,
                cgst: r.cgst,
                sgst: r.sgst,
                cess: r.cess,
                total_tax: r.total_tax,
                place_of_supply: r.place_of_supply,
                return_period: r.return_period,
                source_section: r.source_section,
                source_gstr1_id: r.source_gstr1_id,
                snapshot_month: snapshotMonth,
                snapshot_year: snapshotYear,
                itc_status: 'AVAILABLE',
                created_at: generatedAt
            }));
            await supabase.from('gstr2b_b2b_invoices').insert(b2bSnapshotRecords);
            for (const r of b2bRecords) {
                totalTaxableValue += parseFloat(r.taxable_value) || 0;
                totalIgst += parseFloat(r.igst) || 0;
                totalCgst += parseFloat(r.cgst) || 0;
                totalSgst += parseFloat(r.sgst) || 0;
                totalCess += parseFloat(r.cess) || 0;
            }
        }

        // Step 5: Copy GSTR-2A CDNR → GSTR-2B CDNR
        const { data: cdnrRecords } = await supabase
            .from('gstr2a_credit_debit_notes')
            .select('*')
            .eq('receiver_trn', receiverTrn)
            .eq('status', 'ACTIVE');

        if (cdnrRecords && cdnrRecords.length > 0) {
            const cdnrSnapshotRecords = cdnrRecords.map(r => ({
                snapshot_id: snapshotId,
                supplier_trn: r.supplier_trn,
                receiver_trn: r.receiver_trn,
                supplier_gstin: r.supplier_gstin,
                receiver_gstin: r.receiver_gstin,
                supplier_name: r.supplier_name,
                note_number: r.note_number,
                note_date: r.note_date,
                note_type: r.note_type,
                taxable_value: r.taxable_value,
                rate: r.rate,
                igst: r.igst,
                cgst: r.cgst,
                sgst: r.sgst,
                cess: r.cess,
                total_tax: r.total_tax,
                place_of_supply: r.place_of_supply,
                return_period: r.return_period,
                source_section: r.source_section,
                source_gstr1_id: r.source_gstr1_id,
                snapshot_month: snapshotMonth,
                snapshot_year: snapshotYear,
                itc_status: 'AVAILABLE',
                created_at: generatedAt
            }));
            await supabase.from('gstr2b_credit_debit_notes').insert(cdnrSnapshotRecords);
        }

        // Step 6: Copy GSTR-2A Amended → GSTR-2B Amended
        const { data: amendedRecords } = await supabase
            .from('gstr2a_amended_invoices')
            .select('*')
            .eq('receiver_trn', receiverTrn)
            .eq('status', 'ACTIVE');

        if (amendedRecords && amendedRecords.length > 0) {
            const amendedSnapshotRecords = amendedRecords.map(r => ({
                snapshot_id: snapshotId,
                supplier_trn: r.supplier_trn,
                receiver_trn: r.receiver_trn,
                supplier_gstin: r.supplier_gstin,
                receiver_gstin: r.receiver_gstin,
                supplier_name: r.supplier_name,
                invoice_number: r.invoice_number,
                invoice_date: r.invoice_date,
                taxable_value: r.taxable_value,
                rate: r.rate,
                igst: r.igst,
                cgst: r.cgst,
                sgst: r.sgst,
                cess: r.cess,
                total_tax: r.total_tax,
                place_of_supply: r.place_of_supply,
                return_period: r.return_period,
                source_section: r.source_section,
                source_gstr1_id: r.source_gstr1_id,
                snapshot_month: snapshotMonth,
                snapshot_year: snapshotYear,
                itc_status: 'AVAILABLE',
                created_at: generatedAt
            }));
            await supabase.from('gstr2b_amended_invoices').insert(amendedSnapshotRecords);
        }

        // Step 7: Update snapshot summary totals
        const totalItcAvailable = totalIgst + totalCgst + totalSgst;
        await supabase.from('gstr2b_snapshots').update({
            total_taxable_value: totalTaxableValue,
            total_igst: totalIgst,
            total_cgst: totalCgst,
            total_sgst: totalSgst,
            total_cess: totalCess,
            total_itc_available: totalItcAvailable
        }).eq('id', snapshotId);

        console.log(`[GSTR2B] Snapshot generated for TRN ${receiverTrn}, Month ${month}/${year}`);
        return {
            success: true,
            message: `GSTR-2B for ${getMonthName(month)} ${year} generated successfully.`,
            snapshot: { id: snapshotId, month, year, totalItcAvailable }
        };

    } catch (err) {
        console.error('[GSTR2B] Snapshot generation failed:', err.message);
        return { success: false, message: err.message };
    }
};

// ─────────────────────────────────────────────────────────────
// Fetch GSTR-2A Summary for a receiver
// ─────────────────────────────────────────────────────────────
exports.getGSTR2ASummary = async (receiverTrn) => {
    try {
        const [b2bRes, cdnrRes, amendedRes, isdRes, tdsRes] = await Promise.all([
            supabase.from('gstr2a_b2b_invoices').select('*').eq('receiver_trn', receiverTrn).eq('status', 'ACTIVE'),
            supabase.from('gstr2a_credit_debit_notes').select('*').eq('receiver_trn', receiverTrn).eq('status', 'ACTIVE'),
            supabase.from('gstr2a_amended_invoices').select('*').eq('receiver_trn', receiverTrn).eq('status', 'ACTIVE'),
            supabase.from('gstr2a_isd_invoices').select('*').eq('receiver_trn', receiverTrn).eq('status', 'ACTIVE'),
            supabase.from('gstr2a_tds_tcs').select('*').eq('receiver_trn', receiverTrn).eq('status', 'ACTIVE'),
        ]);

        const b2bRecords = b2bRes.data || [];
        const cdnrRecords = cdnrRes.data || [];
        const amendedRecords = amendedRes.data || [];
        const isdRecords = isdRes.data || [];
        const tdsRecords = tdsRes.data || [];

        const sumRecords = (records) => {
            let taxableValue = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
            records.forEach(r => {
                taxableValue += parseFloat(r.taxable_value || r.gross_value) || 0;
                igst += parseFloat(r.igst) || 0;
                cgst += parseFloat(r.cgst) || 0;
                sgst += parseFloat(r.sgst) || 0;
                cess += parseFloat(r.cess) || 0;
            });
            return { taxableValue, igst, cgst, sgst, cess, totalTax: igst + cgst + sgst + cess };
        };

        const b2bTotals = sumRecords(b2bRecords);
        const cdnrTotals = sumRecords(cdnrRecords);
        const amendedTotals = sumRecords(amendedRecords);
        const isdTotals = sumRecords(isdRecords);
        const tdsTotals = sumRecords(tdsRecords);

        const totalTaxableValue = b2bTotals.taxableValue + cdnrTotals.taxableValue + amendedTotals.taxableValue;
        const totalItcAvailable = b2bTotals.totalTax + isdTotals.totalTax + tdsTotals.totalTax;

        return {
            success: true,
            data: {
                counts: {
                    b2b: b2bRecords.length,
                    cdnr: cdnrRecords.length,
                    amended: amendedRecords.length,
                    isd: isdRecords.length,
                    tds: tdsRecords.length,
                },
                totals: {
                    totalTaxableValue,
                    totalIgst: b2bTotals.igst + cdnrTotals.igst + amendedTotals.igst,
                    totalCgst: b2bTotals.cgst + cdnrTotals.cgst + amendedTotals.cgst,
                    totalSgst: b2bTotals.sgst + cdnrTotals.sgst + amendedTotals.sgst,
                    totalItcAvailable,
                },
                rawRecords: { b2bRecords, cdnrRecords, amendedRecords, isdRecords, tdsRecords }
            }
        };
    } catch (err) {
        console.error('[GSTR2A] Summary fetch failed:', err.message);
        return { success: false, message: err.message };
    }
};

// ─────────────────────────────────────────────────────────────
// Fetch GSTR-2B data for a receiver
// ─────────────────────────────────────────────────────────────
exports.getGSTR2BData = async (receiverTrn, month, year) => {
    try {
        let snapshotQuery = supabase
            .from('gstr2b_snapshots')
            .select('*')
            .eq('receiver_trn', receiverTrn)
            .order('snapshot_year', { ascending: false })
            .order('snapshot_month', { ascending: false });

        if (month) snapshotQuery = snapshotQuery.eq('snapshot_month', month);
        if (year) snapshotQuery = snapshotQuery.eq('snapshot_year', year);

        const { data: snapshots } = await snapshotQuery;
        const latestSnapshot = snapshots && snapshots.length > 0 ? snapshots[0] : null;

        let b2bRecords = [], cdnrRecords = [], amendedRecords = [];

        if (latestSnapshot) {
            const [b2b, cdnr, amended] = await Promise.all([
                supabase.from('gstr2b_b2b_invoices').select('*').eq('snapshot_id', latestSnapshot.id),
                supabase.from('gstr2b_credit_debit_notes').select('*').eq('snapshot_id', latestSnapshot.id),
                supabase.from('gstr2b_amended_invoices').select('*').eq('snapshot_id', latestSnapshot.id),
            ]);
            b2bRecords = b2b.data || [];
            cdnrRecords = cdnr.data || [];
            amendedRecords = amended.data || [];
        }

        return {
            success: true,
            data: {
                snapshots: snapshots || [],
                activeSnapshot: latestSnapshot,
                rawRecords: [...b2bRecords, ...cdnrRecords, ...amendedRecords],
                b2bRecords,
                cdnrRecords,
                amendedRecords
            }
        };
    } catch (err) {
        console.error('[GSTR2B] Data fetch failed:', err.message);
        return { success: false, message: err.message };
    }
};

// ─────────────────────────────────────────────────────────────
// ITC Summary Calculation
// ─────────────────────────────────────────────────────────────
exports.calculateITCSummary = async (receiverTrn) => {
    try {
        const gstr2aData = await exports.getGSTR2ASummary(receiverTrn);
        if (!gstr2aData.success) return gstr2aData;

        const totals = gstr2aData.data.totals;
        return {
            success: true,
            data: {
                eligibleITC: totals.totalItcAvailable,
                ineligibleITC: 0, // Can be extended
                reversedITC: 0,   // Can be extended
                netITCAvailable: totals.totalItcAvailable,
                breakdown: {
                    igst: totals.totalIgst,
                    cgst: totals.totalCgst,
                    sgst: totals.totalSgst,
                }
            }
        };
    } catch (err) {
        return { success: false, message: err.message };
    }
};

// ─────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────
function getMonthName(monthNum) {
    const months = ['January','February','March','April','May','June',
        'July','August','September','October','November','December'];
    return months[monthNum - 1] || monthNum;
}
