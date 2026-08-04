const supabase = require('../config/supabase');

/**
 * Auto-generate GSTR-2B records from GSTR-1 filings.
 * 
 * @param {Array|Object} invoiceData - The invoice(s) data from GSTR-1
 * @param {String} sectionName - The section (e.g. 'GSTR1_B2B_Invoices', 'GSTR1_CDNR_Invoices')
 * @param {String} supplierTrn - The TRN of the supplier filing the GSTR-1
 */
exports.generateGSTR2BFromGSTR1 = async (invoiceData, sectionName, supplierTrn) => {
    try {
        if (!invoiceData) return;
        
        const invoices = Array.isArray(invoiceData) ? invoiceData : [invoiceData];
        if (invoices.length === 0) return;

        // Fetch supplier details
        const { data: supplierData } = await supabase
            .from('business_details')
            .select('legal_name, pan, gstin, trn')
            .eq('trn', supplierTrn)
            .single();

        const supplierName = supplierData?.legal_name || 'Unknown Supplier';
        const supplierGstin = supplierData?.gstin || supplierData?.pan || supplierTrn;

        for (const inv of invoices) {
            // Determine the receiver GSTIN depending on the section structure
            const receiverGstin = inv.recipientGSTIN || inv.recipientGstin || inv.gstin;
            
            if (!receiverGstin) continue;

            // Check if receiver is registered in our system
            const { data: receiverData } = await supabase
                .from('business_details')
                .select('trn')
                .or(`pan.ilike.%${receiverGstin}%,gstin.eq.${receiverGstin}`)
                .limit(1);

            if (!receiverData || receiverData.length === 0) {
                // Receiver not found. Save only GSTR-1 data and do not create 2B record.
                console.log(`generateGSTR2BFromGSTR1: Receiver ${receiverGstin} not found in system. Skipping 2B generation.`);
                continue;
            }

            const receiverTrn = receiverData[0].trn;
            
            // Map common fields based on the section
            let targetTable = '';
            let mappedData = {
                supplier_user_id: supplierTrn,
                receiver_user_id: receiverTrn,
                supplier_gstin: supplierGstin,
                receiver_gstin: receiverGstin,
                supplier_name: supplierName,
                return_period: inv.returnPeriod || new Date().toISOString().slice(0, 7), // fallback to current YYYY-MM
                source_gstr1_id: `${supplierTrn}_${inv.invoiceNo || inv.noteNo}`,
                itc_status: 'AVAILABLE',
                updated_at: new Date().toISOString()
            };

            // Calculate totals from items
            let totalTaxableValue = 0, totalIgst = 0, totalCgst = 0, totalSgst = 0, totalCess = 0;
            const items = inv.itemDetails || inv.items || [];
            for (const item of items) {
                totalTaxableValue += parseFloat(item.taxableValue) || 0;
                totalIgst += parseFloat(item.igst) || 0;
                totalCgst += parseFloat(item.cgst) || 0;
                totalSgst += parseFloat(item.sgst) || 0;
                totalCess += parseFloat(item.cess) || 0;
            }
            
            mappedData.taxable_value = totalTaxableValue;
            mappedData.igst = totalIgst;
            mappedData.cgst = totalCgst;
            mappedData.sgst = totalSgst;
            mappedData.cess = totalCess;
            mappedData.total_tax = totalIgst + totalCgst + totalSgst + totalCess;

            if (sectionName === 'GSTR1_B2B_Invoices') {
                targetTable = 'gstr2b_b2b_invoices';
                mappedData.invoice_number = inv.invoiceNo;
                mappedData.invoice_date = inv.invoiceDate;
                mappedData.place_of_supply = inv.pos;
                mappedData.source_section = 'B2B';
                
            } else if (sectionName === 'GSTR1_CDNR_Invoices') {
                targetTable = 'gstr2b_credit_debit_notes';
                mappedData.invoice_number = inv.noteNo || inv.invoiceNo;
                mappedData.invoice_date = inv.noteDate || inv.invoiceDate;
                mappedData.place_of_supply = inv.pos;
                mappedData.source_section = 'CDNR';
                
            } else if (sectionName === 'GSTR1_B2BA_Invoices') {
                targetTable = 'gstr2b_amended_b2b_invoices';
                mappedData.invoice_number = inv.revisedInvoiceNo || inv.invoiceNo;
                mappedData.invoice_date = inv.revisedInvoiceDate || inv.invoiceDate;
                mappedData.place_of_supply = inv.pos;
                mappedData.source_section = 'B2BA';
                mappedData.source_gstr1_id = `${supplierTrn}_${inv.revisedInvoiceNo || inv.invoiceNo}_amended`;
                
            } else if (sectionName === 'GSTR1_CDNRA_Invoices') {
                targetTable = 'gstr2b_amended_credit_debit_notes';
                mappedData.invoice_number = inv.revisedNoteNo || inv.noteNo;
                mappedData.invoice_date = inv.revisedNoteDate || inv.noteDate;
                mappedData.place_of_supply = inv.pos;
                mappedData.source_section = 'CDNRA';
                mappedData.source_gstr1_id = `${supplierTrn}_${inv.revisedNoteNo || inv.noteNo}_amended`;
                
            } else {
                // Not a supported section for auto-gen
                continue;
            }

            // Insert or update (prevent duplicates)
            const { error } = await supabase
                .from(targetTable)
                .upsert(mappedData, { onConflict: 'receiver_gstin, source_gstr1_id' });

            if (error) {
                console.error(`[gstr2bService] Failed to auto-generate 2B record in ${targetTable}:`, error.message);
            } else {
                console.log(`[gstr2bService] Successfully generated/updated 2B record in ${targetTable} for ${receiverGstin}`);
            }
        }
    } catch (err) {
        console.error('[gstr2bService] Auto-generation error:', err.message);
    }
};

/**
 * Handle deletion of a GSTR-1 record by marking the corresponding GSTR-2B record as REMOVED.
 */
exports.removeGSTR2BRecord = async (sourceGstr1Id, sectionName) => {
    try {
        let targetTable = '';
        if (sectionName === 'GSTR1_B2B_Invoices') targetTable = 'gstr2b_b2b_invoices';
        else if (sectionName === 'GSTR1_CDNR_Invoices') targetTable = 'gstr2b_credit_debit_notes';
        else if (sectionName === 'GSTR1_B2BA_Invoices') targetTable = 'gstr2b_amended_b2b_invoices';
        else if (sectionName === 'GSTR1_CDNRA_Invoices') targetTable = 'gstr2b_amended_credit_debit_notes';
        else return;

        const { error } = await supabase
            .from(targetTable)
            .update({ itc_status: 'REMOVED', updated_at: new Date().toISOString() })
            .eq('source_gstr1_id', sourceGstr1Id);
            
        if (error) {
            console.error(`[gstr2bService] Failed to mark 2B record as REMOVED in ${targetTable}:`, error.message);
        } else {
            console.log(`[gstr2bService] Marked 2B record as REMOVED in ${targetTable}`);
        }
    } catch (err) {
        console.error('[gstr2bService] Deletion auto-update error:', err.message);
    }
};
