const supabase = require('../config/supabase');
const gstr2aService = require('../services/gstr2aService');
const gstr2bService = require('../services/gstr2bService');
const fs = require('fs');
const path = require('path');
const LOCAL_DB_PATH = path.join(__dirname, '../local_db.json');

const readLocalDb = () => {
    try {
        if (fs.existsSync(LOCAL_DB_PATH)) {
            const fileData = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
            return JSON.parse(fileData || '{}');
        }
    } catch (e) {
        console.error("Failed to read local DB:", e.message);
    }
    return {};
};

const writeLocalDb = (data) => {
    try {
        fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error("Failed to write local DB:", e.message);
    }
};

// @desc    Save general form tab data
// @route   POST /api/forms/save-tab
// @access  Public
exports.saveTab = async (req, res) => {
    try {
        const { trn, tabName, data } = req.body;

        if (!trn || !tabName) {
            return res.status(400).json({ success: false, message: 'TRN and tabName are required' });
        }

        // Save to local file-based backup always to guarantee persistence in paused/offline mode
        let localDb = readLocalDb();
        if (!localDb[trn]) localDb[trn] = {};
        localDb[trn][tabName] = data;
        writeLocalDb(localDb);

        // Determine action_key based on tabName
        let actionKey = '';
        switch(tabName) {
            case 'PromoterPartners': actionKey = 'reg_promoter_partners'; break;
            case 'AuthorizedSignatory': actionKey = 'reg_auth_signatory'; break;
            case 'AuthorizedRepresentative': actionKey = 'reg_auth_signatory'; break; // Maps to similar cost
            case 'PrincipalPlaceOfBusiness': actionKey = 'reg_principal_place'; break;
            case 'AdditionalPlacesOfBusiness': actionKey = 'reg_additional_place'; break;
            case 'GoodsAndServices': actionKey = 'reg_goods_services'; break;
            case 'StateSpecificInformation': actionKey = 'reg_started'; break;
            case 'Verification': actionKey = 'reg_verification'; break;
            case 'AadhaarAuthentication': actionKey = 'reg_verification'; break;
            default: actionKey = 'reg_started';
        }

        // We assume req.user is set by auth middleware, if not we need it from the request body or token
        // In the GST app, auth middleware sets req.user
        const userId = req.user ? req.user.id : (req.body.userId || '00000000-0000-0000-0000-000000000000');

        // Save back using ATOMIC RPC to handle credit deduction and data insertion in one transaction
        const { data: rpcData, error: updateErr } = await supabase
            .rpc('atomic_save_tab_and_burn', {
                p_user_id: userId,
                p_trn: trn,
                p_tab_name: tabName,
                p_tab_data: data,
                p_action_key: actionKey
            });

        if (updateErr) {
            console.error('Supabase Error saving tab:', updateErr.message);
            if (updateErr.message && updateErr.message.includes('INSUFFICIENT_CREDITS')) {
                return res.status(402).json({ success: false, message: 'Insufficient credits to perform this action.' });
            }

            // Fallback: If RPC fails due to schema issues or project paused, use local mock
            return res.status(200).json({ success: true, message: 'Saved to mock storage temporarily', fallback: true });
        }

        // Special Handling: Save to structured tables if needed
        if (tabName === 'PromoterPartners') {
            const mappedData = {
                trn,
                first_name: data.firstName,
                middle_name: data.middleName,
                last_name: data.lastName,
                father_first_name: data.fatherFirstName,
                father_middle_name: data.fatherMiddleName,
                father_last_name: data.fatherLastName,
                dob: (data.dob && data.dob !== "") ? data.dob : null,
                mobile: data.mobile,
                email: data.email,
                gender: data.gender,
                std_code: data.stdCode,
                telephone: data.telephone,
                designation: data.designation,
                din: data.din,
                citizen_of_india: data.citizenOfIndia !== undefined ? data.citizenOfIndia : true,
                pan: data.pan,
                passport: data.passport,
                aadhaar: data.aadhaar,
                country: data.country || 'India',
                pin_code: data.pinCode,
                state: data.state,
                district: data.district,
                city: data.city,
                locality: data.locality,
                road: data.road,
                premises: data.premises,
                building_no: data.buildingNo,
                floor_no: data.floorNo,
                landmark: data.landmark,
                also_signatory: data.alsoSignatory || false,
                updated_at: new Date().toISOString()
            };

            const { error: promoErr } = await supabase
                .from('promoter_partners')
                .upsert(mappedData, { onConflict: 'trn' });

            if (promoErr) {
                console.warn('Note: Could not save to structured promoter_partners table (table might not exist yet). Falling back to JSON storage.', promoErr.message);
            }
        }

        if (tabName === 'AuthorizedSignatory') {
            const mappedData = {
                trn,
                primary_signatory: data.primarySignatory || false,
                first_name: data.firstName,
                middle_name: data.middleName,
                last_name: data.lastName,
                father_first_name: data.fatherFirstName,
                father_middle_name: data.fatherMiddleName,
                father_last_name: data.fatherLastName,
                dob: (data.dob && data.dob !== "") ? data.dob : null,
                mobile: data.mobile,
                email: data.email,
                gender: data.gender,
                std_code: data.stdCode,
                telephone: data.telephone,
                designation: data.designation,
                din: data.din,
                citizen_of_india: data.citizenOfIndia !== undefined ? data.citizenOfIndia : true,
                pan: data.pan,
                passport: data.passport,
                aadhaar: data.aadhaar,
                country: data.country || 'India',
                pin_code: data.pinCode,
                state: data.state,
                district: data.district,
                city: data.city,
                locality: data.locality,
                road: data.road,
                premises: data.premises,
                building_no: data.buildingNo,
                floor_no: data.floorNo,
                landmark: data.landmark,
                proof_type: data.proofType,
                updated_at: new Date().toISOString()
            };

            const { error: sigErr } = await supabase
                .from('authorized_signatories')
                .upsert(mappedData, { onConflict: 'trn' });

            if (sigErr) {
                console.warn('Note: Could not save to structured authorized_signatories table.', sigErr.message);
            }
        }

        if (tabName === 'AuthorizedRepresentative') {
            const mappedData = {
                trn,
                has_representative: data.hasRepresentative || false,
                representative_type: data.repType,
                enrolment_id: data.enrolmentId,
                first_name: data.firstName,
                middle_name: data.middleName,
                last_name: data.lastName,
                designation: data.designation,
                mobile: data.mobile,
                email: data.email,
                pan: data.pan,
                aadhaar: data.aadhaar,
                std_tel: data.stdTel,
                telephone: data.telephone,
                std_fax: data.stdFax,
                fax: data.fax,
                updated_at: new Date().toISOString()
            };

            const { error: repErr } = await supabase
                .from('authorized_representatives')
                .upsert(mappedData, { onConflict: 'trn' });

            if (repErr) {
                console.warn('Note: Could not save to structured authorized_representatives table.', repErr.message);
            }
        }

        if (tabName === 'PrincipalPlaceOfBusiness') {
            const mappedData = {
                trn,
                pin_code: data.pinCode,
                state: data.state,
                district: data.district,
                city: data.city,
                locality: data.locality,
                road: data.road,
                premises: data.premises,
                building_no: data.buildingNo,
                floor_no: data.floorNo,
                landmark: data.landmark,
                latitude: data.latitude,
                longitude: data.longitude,
                sector: data.sector,
                commissionerate: data.commissionerate,
                division: data.division,
                range: data.range,
                email: data.email,
                std_tel: data.stdTel,
                telephone: data.telephone,
                mobile: data.mobile,
                std_fax: data.stdFax,
                fax: data.fax,
                possession: data.possession,
                proof_type: data.proofType,
                activities: Array.isArray(data.activities) ? data.activities : (data.activities ? [data.activities] : []),
                has_additional: data.hasAdditional || false,
                updated_at: new Date().toISOString()
            };

            const { error: ppErr } = await supabase
                .from('principal_places')
                .upsert(mappedData, { onConflict: 'trn' });

            if (ppErr) {
                console.warn('Note: Could not save to structured principal_places table.', ppErr.message);
            }
        }

        if (tabName === 'AdditionalPlacesOfBusiness') {
            const mappedData = {
                trn,
                pin_code: data.pinCode,
                state: data.state,
                district: data.district,
                city: data.city,
                locality: data.locality,
                road: data.road,
                premises: data.premises,
                building_no: data.buildingNo,
                floor_no: data.floorNo,
                landmark: data.landmark,
                latitude: data.latitude,
                longitude: data.longitude,
                email: data.email,
                std_tel: data.stdTel,
                telephone: data.telephone,
                mobile: data.mobile,
                std_fax: data.stdFax,
                fax: data.fax,
                possession: data.possession,
                proof_type: data.proofType,
                activities: Array.isArray(data.activities) ? data.activities : (data.activities ? [data.activities] : []),
                updated_at: new Date().toISOString()
            };

            // For additional places, we might want to allow multiple. 
            // But to stay consistent with the "tab save" pattern, we'll upsert based on TRN for now.
            // If the user wants multiple, we'd need a different frontend pattern.
            const { error: apErr } = await supabase
                .from('additional_places')
                .upsert(mappedData, { onConflict: 'trn' });

            if (apErr) {
                console.warn('Note: Could not save to structured additional_places table.', apErr.message);
            }
        }

        if (tabName === 'StateSpecificInformation') {
            const mappedData = {
                trn,
                pt_ec_no: data.ptEcNo,
                pt_rc_no: data.ptRcNo,
                excise_license_no: data.exciseLicenseNo,
                excise_license_name: data.exciseLicenseName,
                updated_at: new Date().toISOString()
            };

            const { error: ssErr } = await supabase
                .from('state_specific_info')
                .upsert(mappedData, { onConflict: 'trn' });

            if (ssErr) {
                console.warn('Note: Could not save to structured state_specific_info table.', ssErr.message);
            }
        }

        if (tabName === 'GoodsAndServices') {
            const mappedData = {
                trn,
                goods: Array.isArray(data.goods) ? data.goods : (data.goods ? [data.goods] : []),
                services: Array.isArray(data.services) ? data.services : (data.services ? [data.services] : []),
                updated_at: new Date().toISOString()
            };

            const { error: gsErr } = await supabase
                .from('goods_and_services')
                .upsert(mappedData, { onConflict: 'trn' });

            if (gsErr) {
                console.warn('Note: Could not save to structured goods_and_services table.', gsErr.message);
            }
        }

        if (tabName === 'AadhaarAuthentication') {
            const mappedData = {
                trn,
                opt_for_auth: data.optForAuth !== undefined ? data.optForAuth : true,
                updated_at: new Date().toISOString()
            };

            const { error: aaErr } = await supabase
                .from('aadhaar_auth')
                .upsert(mappedData, { onConflict: 'trn' });

            if (aaErr) {
                console.warn('Note: Could not save to structured aadhaar_auth table.', aaErr.message);
            }
        }

        if (tabName === 'Verification') {
            const mappedData = {
                trn,
                declarer_name: data.declarerName,
                place: data.place,
                designation: data.designation,
                verified: data.verified || false,
                submitted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { error: vErr } = await supabase
                .from('verification')
                .upsert(mappedData, { onConflict: 'trn' });

            if (vErr) {
                console.warn('Note: Could not save to structured verification table.', vErr.message);
            }
        }

        if (tabName === 'GSTR1_B2B_Invoices') {
            const invoices = Array.isArray(data.invoices) ? data.invoices : [];
            for (const inv of invoices) {
                const mappedData = {
                    trn,
                    recipient_gstin: inv.recipientGSTIN,
                    recipient_name: inv.recipientName,
                    invoice_no: inv.invoiceNo,
                    invoice_date: inv.invoiceDate,
                    total_invoice_value: parseFloat(inv.totalInvoiceValue) || 0,
                    pos: inv.pos,
                    supply_type: inv.supplyType || '',
                    is_deemed_export: inv.isDeemedExport || false,
                    is_sez_with_payment: inv.isSEZWithPayment || false,
                    is_sez_without_payment: inv.isSEZWithoutPayment || false,
                    is_reverse_charge: inv.isReverseCharge || false,
                    is_intra_state_igst: inv.isIntraStateIGST || false,
                    is_differential_percentage: inv.isDifferentialPercentage || false,
                    tax_items: inv.itemDetails || [],
                    updated_at: new Date().toISOString()
                };

                const { error: invErr } = await supabase
                    .from('gstr1_b2b_invoices')
                    .upsert(mappedData, { onConflict: 'trn, invoice_no' });

                if (invErr) {
                    console.warn(`Note: Could not save invoice ${inv.invoiceNo} to structured table.`, invErr.message);
                }
            }
            // Auto-generate GSTR-2A (live, dynamic) from GSTR-1
            gstr2aService.generateGSTR2AFromGSTR1(invoices, 'GSTR1_B2B_Invoices', trn).catch(err => console.error('[GSTR2A] B2B:', err));
            // Also keep legacy GSTR-2B direct sync
            gstr2bService.generateGSTR2BFromGSTR1(invoices, 'GSTR1_B2B_Invoices', trn).catch(err => console.error(err));
        }

        if (tabName === 'GSTR1_B2CL_Invoices') {
            const invoices = Array.isArray(data.invoices) ? data.invoices : [];
            for (const inv of invoices) {
                const mappedData = {
                    trn,
                    pos: inv.pos,
                    invoice_no: inv.invoiceNo,
                    invoice_date: inv.invoiceDate,
                    supply_type: inv.supplyType || 'Inter-State',
                    total_invoice_value: parseFloat(inv.totalInvoiceValue) || 0,
                    is_differential: inv.isDifferential || false,
                    item_details: inv.itemDetails || [],
                    updated_at: new Date().toISOString()
                };

                const { error: invErr } = await supabase
                    .from('gstr1_b2cl_invoices')
                    .upsert(mappedData, { onConflict: 'trn, invoice_no' });

                if (invErr) {
                    console.warn(`Note: Could not save B2CL invoice ${inv.invoiceNo} to structured table.`, invErr.message);
                }
            }
        }

        if (tabName === 'GSTR1_Exports_Invoices') {
            const invoices = Array.isArray(data.invoices) ? data.invoices : [];
            for (const inv of invoices) {
                const mappedData = {
                    trn,
                    invoice_no: inv.invoiceNo,
                    invoice_date: inv.invoiceDate,
                    port_code: inv.portCode,
                    shipping_bill_no: inv.shippingBillNo,
                    shipping_bill_date: inv.shippingBillDate,
                    total_invoice_value: parseFloat(inv.totalInvoiceValue) || 0,
                    supply_type: inv.supplyType || 'Inter-State',
                    gst_payment: inv.gstPayment,
                    item_details: inv.itemDetails || [],
                    updated_at: new Date().toISOString()
                };

                const { error: invErr } = await supabase
                    .from('gstr1_exports_invoices')
                    .upsert(mappedData, { onConflict: 'trn, invoice_no' });

                if (invErr) {
                    console.warn(`Note: Could not save Export invoice ${inv.invoiceNo} to structured table.`, invErr.message);
                }
            }
        }

        if (tabName === 'GSTR1_B2CS_Invoices') {
            const invoices = Array.isArray(data.invoices) ? data.invoices : [];
            // B2CS doesn't have unique invoice numbers, so delete existing and re-insert
            await supabase.from('gstr1_b2cs_invoices').delete().eq('trn', trn);

            for (const inv of invoices) {
                const mappedData = {
                    trn,
                    pos: inv.pos,
                    taxable_value: parseFloat(inv.taxableValue) || 0,
                    supply_type: inv.supplyType || 'Intra-State',
                    is_differential_rate: inv.isDifferentialRate || false,
                    rate: inv.rate,
                    updated_at: new Date().toISOString()
                };

                const { error: invErr } = await supabase
                    .from('gstr1_b2cs_invoices')
                    .insert(mappedData);

                if (invErr) {
                    console.warn(`Note: Could not save B2CS record to structured table.`, invErr.message);
                }
            }
        }

        if (tabName === 'GSTR1_NilRated_Supplies') {
            const invoices = Array.isArray(data.invoices) ? data.invoices : [];
            for (const inv of invoices) {
                const mappedData = {
                    trn,
                    description: inv.description,
                    nil_rated_value: parseFloat(inv.nilRated) || 0,
                    exempted_value: parseFloat(inv.exempted) || 0,
                    non_gst_value: parseFloat(inv.nonGst) || 0,
                    updated_at: new Date().toISOString()
                };

                const { error: invErr } = await supabase
                    .from('gstr1_nil_rated_supplies')
                    .upsert(mappedData, { onConflict: 'trn, description' });

                if (invErr) {
                    console.warn(`Note: Could not save Nil Rated record to structured table.`, invErr.message);
                }
            }
        }

        if (tabName === 'GSTR1_CDNR_Invoices') {
            const invoices = Array.isArray(data.invoices) ? data.invoices : [];
            for (const inv of invoices) {
                const mappedData = {
                    trn,
                    recipient_gstin: inv.recipientGstin,
                    recipient_name: inv.recipientName,
                    name_in_master: inv.nameInMaster,
                    note_number: inv.noteNumber,
                    note_date: inv.noteDate,
                    note_type: inv.noteType,
                    note_value: parseFloat(inv.noteValue) || 0,
                    pos: inv.pos,
                    supply_type: inv.supplyType,
                    source: inv.source,
                    irn: inv.irn,
                    irn_date: inv.irnDate,
                    is_deemed_export: inv.deemedExports || false,
                    is_sez_with_payment: inv.sezWithPayment || false,
                    is_sez_without_payment: inv.sezWithoutPayment || false,
                    is_reverse_charge: inv.reverseCharge || false,
                    is_intra_state_igst: inv.intraStateIgst || false,
                    is_differential_rate: inv.differentialRate || false,
                    updated_at: new Date().toISOString()
                };

                const { error: invErr } = await supabase
                    .from('gstr1_cdnr_invoices')
                    .upsert(mappedData, { onConflict: 'trn, note_number' });

                if (invErr) {
                    console.warn(`Note: Could not save CDNR invoice ${inv.noteNumber} to structured table.`, invErr.message);
                }
            }
            // Auto-generate GSTR-2A (live, dynamic) from GSTR-1
            gstr2aService.generateGSTR2AFromGSTR1(invoices, 'GSTR1_CDNR_Invoices', trn).catch(err => console.error('[GSTR2A] CDNR:', err));
            // Also keep legacy GSTR-2B direct sync
            gstr2bService.generateGSTR2BFromGSTR1(invoices, 'GSTR1_CDNR_Invoices', trn).catch(err => console.error(err));
        }

        if (tabName === 'GSTR1_CDNUR_Invoices') {
            const invoices = Array.isArray(data.invoices) ? data.invoices : [];
            for (const inv of invoices) {
                const mappedData = {
                    trn,
                    unregistered_type: inv.type,
                    note_number: inv.noteNumber,
                    note_date: inv.noteDate,
                    note_value: parseFloat(inv.noteValue) || 0,
                    note_type: inv.noteType,
                    pos: inv.pos,
                    supply_type: inv.supplyType || 'Inter-State',
                    is_differential_rate: inv.differentialRate || false,
                    source: inv.source,
                    irn: inv.irn,
                    irn_date: inv.irnDate,
                    tax_details: inv.taxDetails || {},
                    updated_at: new Date().toISOString()
                };

                const { error: invErr } = await supabase
                    .from('gstr1_cdnur_invoices')
                    .upsert(mappedData, { onConflict: 'trn, note_number' });

                if (invErr) {
                    console.warn(`Note: Could not save CDNUR invoice ${inv.noteNumber} to structured table.`, invErr.message);
                }
            }
        }

        if (tabName === 'GSTR1_AdvTax_Invoices') {
            const records = Array.isArray(data.records) ? data.records : [];
            for (const rec of records) {
                const mappedData = {
                    trn,
                    pos: rec.pos,
                    supply_type: rec.supplyType || 'Inter-State',
                    is_differential_rate: rec.differentialRate || false,
                    gross_advance_received: parseFloat(rec.grossAdvance) || 0,
                    rate: rec.rate,
                    integrated_tax: parseFloat(rec.igst) || 0,
                    central_tax: parseFloat(rec.cgst) || 0,
                    state_ut_tax: parseFloat(rec.sgst) || 0,
                    cess: parseFloat(rec.cess) || 0,
                    updated_at: new Date().toISOString()
                };

                const { error: invErr } = await supabase
                    .from('gstr1_adv_tax')
                    .upsert(mappedData, { onConflict: 'trn, pos, rate' });

                if (invErr) {
                    console.warn(`Note: Could not save AdvTax record ${rec.pos} to structured table.`, invErr.message);
                }
            }
        }

        if (tabName === 'GSTR1_AdjAdvances_Invoices') {
            const records = Array.isArray(data.records) ? data.records : [];
            for (const rec of records) {
                const mappedData = {
                    trn,
                    pos: rec.pos,
                    supply_type: rec.supplyType || 'Inter-State',
                    is_differential_rate: rec.differentialRate || false,
                    gross_advance_adjusted: parseFloat(rec.grossAdjustment) || 0,
                    rate: rec.rate,
                    integrated_tax: parseFloat(rec.igst) || 0,
                    central_tax: parseFloat(rec.cgst) || 0,
                    state_ut_tax: parseFloat(rec.sgst) || 0,
                    cess: parseFloat(rec.cess) || 0,
                    updated_at: new Date().toISOString()
                };

                const { error: invErr } = await supabase
                    .from('gstr1_adj_advances')
                    .upsert(mappedData, { onConflict: 'trn, pos, rate' });

                if (invErr) {
                    console.warn(`Note: Could not save AdjAdvance record ${rec.pos} to structured table.`, invErr.message);
                }
            }
        }

        if (tabName === 'GSTR1_HSN_B2B' || tabName === 'GSTR1_HSN_B2C') {
            const records = Array.isArray(data.records) ? data.records : [];
            const supplyType = tabName === 'GSTR1_HSN_B2B' ? 'B2B' : 'B2C';
            for (const rec of records) {
                const mappedData = {
                    trn,
                    hsn: rec.hsn,
                    description: rec.description,
                    product_name_master: rec.productNameMaster,
                    description_per_hsn: rec.descriptionAsPerHSN,
                    uqc: rec.uqc,
                    total_quantity: parseFloat(rec.totalQuantity) || 0,
                    total_taxable_value: parseFloat(rec.totalTaxableValue) || 0,
                    rate: rec.rate,
                    integrated_tax: parseFloat(rec.integratedTax) || 0,
                    central_tax: parseFloat(rec.centralTax) || 0,
                    state_tax: parseFloat(rec.stateTax) || 0,
                    cess: parseFloat(rec.cess) || 0,
                    supply_type: supplyType,
                    updated_at: new Date().toISOString()
                };

                const { error: hsnErr } = await supabase
                    .from('gstr1_hsn_summary')
                    .upsert(mappedData, { onConflict: 'trn, hsn, rate, uqc, supply_type' });

                if (hsnErr) {
                    console.warn(`Note: Could not save HSN record ${rec.hsn} to structured table.`, hsnErr.message);
                }
            }
        }

        if (tabName === 'GSTR1_Docs_Issued') {
            const docs = Array.isArray(data.documents) ? data.documents : [];
            // If empty, we still want it to be considered for structured storage (or at least cleared)
            // But for now, we just ensure it's saved to the general storage (which happens at the top)
            for (const doc of docs) {
                // Skip completely empty rows
                if (!doc.category || !doc.fromSerial) continue;

                const mappedData = {
                    trn,
                    category: doc.category,
                    from_serial_no: doc.fromSerial,
                    to_serial_no: doc.toSerial,
                    total_number: parseInt(doc.total) || 0,
                    cancelled: parseInt(doc.cancelled) || 0,
                    net_issued: parseInt(doc.net) || 0,
                    updated_at: new Date().toISOString()
                };

                const { error: docErr } = await supabase
                    .from('gstr1_docs_issued')
                    .upsert(mappedData, { onConflict: 'trn, category, from_serial_no' });

                if (docErr) {
                    console.warn(`Note: Could not save Doc record to structured table.`, docErr.message);
                }
            }
        }

        if (tabName === 'GSTR1_ECO_TCS' || tabName === 'GSTR1_ECO_PAY') {
            const records = Array.isArray(data.records) ? data.records : [];
            const ecoType = tabName === 'GSTR1_ECO_TCS' ? 'TCS' : 'PAY';
            for (const rec of records) {
                const mappedData = {
                    trn,
                    eco_type: ecoType,
                    eco_gstin: rec.gstin,
                    trade_name: rec.tradeName,
                    net_value: parseFloat(rec.netValue) || 0,
                    integrated_tax: parseFloat(rec.integratedTax) || 0,
                    central_tax: parseFloat(rec.centralTax) || 0,
                    state_tax: parseFloat(rec.stateTax) || 0,
                    cess: parseFloat(rec.cess) || 0,
                    updated_at: new Date().toISOString()
                };

                const { error: ecoErr } = await supabase
                    .from('gstr1_eco_supplies')
                    .upsert(mappedData, { onConflict: 'trn, eco_type, eco_gstin' });

                if (ecoErr) {
                    console.warn(`Note: Could not save ECO record ${rec.gstin} to structured table.`, ecoErr.message);
                }
            }
        }

        if (tabName.startsWith('GSTR1_SUP95_')) {
            const records = Array.isArray(data.records) ? data.records : [];
            const tabType = tabName.replace('GSTR1_SUP95_', '');
            for (const rec of records) {
                // For B2B types (R2R, NR2R) the frontend sends itemDetails array
                if (rec.itemDetails && Array.isArray(rec.itemDetails)) {
                    for (const item of rec.itemDetails) {
                        // Skip rows with no taxable value
                        if (!item.taxableValue) continue;

                        const mappedData = {
                            trn,
                            tab_type: tabType,
                            supplier_gstin: rec.supplierGstin,
                            supplier_name: rec.supplierName,
                            pos: rec.pos,
                            supply_type: rec.supplyType,
                            taxable_value: parseFloat(item.taxableValue) || 0,
                            rate: item.rate,
                            recipient_gstin: rec.recipientGstin,
                            recipient_name: rec.recipientName,
                            document_number: rec.documentNumber,
                            document_date: rec.documentDate,
                            total_value: parseFloat(rec.totalValue) || 0,
                            is_deemed_exports: rec.deemedExports || false,
                            is_sez_with_payment: rec.sezWithPayment || false,
                            is_sez_without_payment: rec.sezWithoutPayment || false,
                            updated_at: new Date().toISOString()
                        };

                        const { error: supErr } = await supabase
                            .from('gstr1_sup95')
                            .upsert(mappedData, { onConflict: 'trn, tab_type, document_number, pos, rate, supplier_gstin, recipient_gstin' });

                        if (supErr) {
                            console.warn(`Note: Could not save Sup95 B2B record to structured table.`, supErr.message);
                        }
                    }
                } else {
                    // For B2C types (R2NR, NR2NR) the frontend sends rate and taxableValue directly
                    const mappedData = {
                        trn,
                        tab_type: tabType,
                        supplier_gstin: rec.supplierGstin,
                        supplier_name: rec.supplierName,
                        pos: rec.pos,
                        supply_type: rec.supplyType,
                        taxable_value: parseFloat(rec.taxableValue) || 0,
                        rate: rec.rate,
                        recipient_gstin: rec.recipientGstin,
                        recipient_name: rec.recipientName,
                        document_number: rec.documentNumber,
                        document_date: rec.documentDate,
                        total_value: parseFloat(rec.totalValue) || 0,
                        is_deemed_exports: rec.deemedExports || false,
                        is_sez_with_payment: rec.sezWithPayment || false,
                        is_sez_without_payment: rec.sezWithoutPayment || false,
                        updated_at: new Date().toISOString()
                    };

                    const { error: supErr } = await supabase
                        .from('gstr1_sup95')
                        .upsert(mappedData, { onConflict: 'trn, tab_type, document_number, pos, rate, supplier_gstin, recipient_gstin' });

                    if (supErr) {
                        console.warn(`Note: Could not save Sup95 B2C record to structured table.`, supErr.message);
                    }
                }
            }
        }

        // ── GSTR-2A Auto-generation for Amended B2B (B2BA) ──────────────────────
        if (tabName === 'GSTR1_B2B_AmendmentSummary' || tabName === 'GSTR1_B2BA_Invoices') {
            const invoices = Array.isArray(data.invoices) ? data.invoices : (Array.isArray(data.records) ? data.records : []);
            if (invoices.length > 0) {
                gstr2aService.generateGSTR2AFromGSTR1(invoices, 'GSTR1_B2BA_Invoices', trn)
                    .catch(err => console.error('[GSTR2A] B2BA:', err.message));
                gstr2bService.generateGSTR2BFromGSTR1(invoices, 'GSTR1_B2BA_Invoices', trn)
                    .catch(err => console.error('[GSTR2B] B2BA:', err.message));
            }
        }

        // ── GSTR-2A Auto-generation for Amended CDNR (CDNRA) ───────────────────
        if (tabName === 'GSTR1_CDNR_AmendmentSummary' || tabName === 'GSTR1_CDNRA_Invoices') {
            const invoices = Array.isArray(data.invoices) ? data.invoices : (Array.isArray(data.records) ? data.records : []);
            if (invoices.length > 0) {
                gstr2aService.generateGSTR2AFromGSTR1(invoices, 'GSTR1_CDNRA_Invoices', trn)
                    .catch(err => console.error('[GSTR2A] CDNRA:', err.message));
                gstr2bService.generateGSTR2BFromGSTR1(invoices, 'GSTR1_CDNRA_Invoices', trn)
                    .catch(err => console.error('[GSTR2B] CDNRA:', err.message));
            }
        }

        res.status(200).json({
            success: true,
            message: `Tab ${tabName} saved successfully.`
        });
    } catch (err) {
        console.error('Save Tab Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get form tab data
// @route   GET /api/forms/tab/:trn/:tabName
// @access  Public
exports.getTab = async (req, res) => {
    try {
        const { trn, tabName } = req.params;

        // Check business_details first
        const { data: existing, error: fetchErr } = await supabase
            .from('business_details')
            .select('form_tabs_data')
            .eq('trn', trn)
            .single();

        let returnedData = {};
        if (!fetchErr && existing && existing.form_tabs_data) {
            let parsed = typeof existing.form_tabs_data === 'string' ? JSON.parse(existing.form_tabs_data) : existing.form_tabs_data;
            if (parsed[tabName]) {
                returnedData = parsed[tabName];
            }
        }

        // Load from local file-based backup if Supabase is offline/paused or record not found in DB
        if (Object.keys(returnedData).length === 0) {
            const localDb = readLocalDb();
            if (localDb[trn] && localDb[trn][tabName]) {
                returnedData = localDb[trn][tabName];
            }
        }

        // If data is empty or it's the specific tab, try structured tables
        if (tabName === 'PromoterPartners' && Object.keys(returnedData).length === 0) {
            const { data: promoData, error: promoErr } = await supabase
                .from('promoter_partners')
                .select('*')
                .eq('trn', trn)
                .single();

            if (!promoErr && promoData) {
                // Map back to camelCase for the frontend
                returnedData = {
                    firstName: promoData.first_name,
                    middleName: promoData.middle_name,
                    lastName: promoData.last_name,
                    fatherFirstName: promoData.father_first_name,
                    fatherMiddleName: promoData.father_middle_name,
                    fatherLastName: promoData.father_last_name,
                    dob: promoData.dob,
                    mobile: promoData.mobile,
                    email: promoData.email,
                    gender: promoData.gender,
                    stdCode: promoData.std_code,
                    telephone: promoData.telephone,
                    designation: promoData.designation,
                    din: promoData.din,
                    citizenOfIndia: promoData.citizen_of_india,
                    pan: promoData.pan,
                    passport: promoData.passport,
                    aadhaar: promoData.aadhaar,
                    country: promoData.country,
                    pinCode: promoData.pin_code,
                    state: promoData.state,
                    district: promoData.district,
                    city: promoData.city,
                    locality: promoData.locality,
                    road: promoData.road,
                    premises: promoData.premises,
                    buildingNo: promoData.building_no,
                    floorNo: promoData.floor_no,
                    landmark: promoData.landmark,
                    alsoSignatory: promoData.also_signatory
                };
            }
        }

        if (tabName === 'AuthorizedSignatory' && Object.keys(returnedData).length === 0) {
            const { data: sigData, error: sigErr } = await supabase
                .from('authorized_signatories')
                .select('*')
                .eq('trn', trn)
                .single();

            if (!sigErr && sigData) {
                returnedData = {
                    primarySignatory: sigData.primary_signatory,
                    firstName: sigData.first_name,
                    middleName: sigData.middle_name,
                    lastName: sigData.last_name,
                    fatherFirstName: sigData.father_first_name,
                    fatherMiddleName: sigData.father_middle_name,
                    fatherLastName: sigData.father_last_name,
                    dob: sigData.dob,
                    mobile: sigData.mobile,
                    email: sigData.email,
                    gender: sigData.gender,
                    stdCode: sigData.std_code,
                    telephone: sigData.telephone,
                    designation: sigData.designation,
                    din: sigData.din,
                    citizenOfIndia: sigData.citizen_of_india,
                    pan: sigData.pan,
                    passport: sigData.passport,
                    aadhaar: sigData.aadhaar,
                    country: sigData.country,
                    pinCode: sigData.pin_code,
                    state: sigData.state,
                    district: sigData.district,
                    city: sigData.city,
                    locality: sigData.locality,
                    road: sigData.road,
                    premises: sigData.premises,
                    buildingNo: sigData.building_no,
                    floorNo: sigData.floor_no,
                    landmark: sigData.landmark,
                    proofType: sigData.proof_type
                };
            }
        }

        if (tabName === 'AuthorizedRepresentative' && Object.keys(returnedData).length === 0) {
            const { data: repData, error: repErr } = await supabase
                .from('authorized_representatives')
                .select('*')
                .eq('trn', trn)
                .single();

            if (!repErr && repData) {
                returnedData = {
                    hasRepresentative: repData.has_representative,
                    repType: repData.representative_type,
                    enrolmentId: repData.enrolment_id,
                    firstName: repData.first_name,
                    middleName: repData.middle_name,
                    lastName: repData.last_name,
                    designation: repData.designation,
                    mobile: repData.mobile,
                    email: repData.email,
                    pan: repData.pan,
                    aadhaar: repData.aadhaar,
                    stdTel: repData.std_tel,
                    telephone: repData.telephone,
                    stdFax: repData.std_fax,
                    fax: repData.fax
                };
            }
        }

        if (tabName === 'PrincipalPlaceOfBusiness' && Object.keys(returnedData).length === 0) {
            const { data: ppData, error: ppErr } = await supabase
                .from('principal_places')
                .select('*')
                .eq('trn', trn)
                .single();

            if (!ppErr && ppData) {
                returnedData = {
                    pinCode: ppData.pin_code,
                    state: ppData.state,
                    district: ppData.district,
                    city: ppData.city,
                    locality: ppData.locality,
                    road: ppData.road,
                    premises: ppData.premises,
                    buildingNo: ppData.building_no,
                    floorNo: ppData.floor_no,
                    landmark: ppData.landmark,
                    latitude: ppData.latitude,
                    longitude: ppData.longitude,
                    sector: ppData.sector,
                    commissionerate: ppData.commissionerate,
                    division: ppData.division,
                    range: ppData.range,
                    email: ppData.email,
                    stdTel: ppData.std_tel,
                    telephone: ppData.telephone,
                    mobile: ppData.mobile,
                    stdFax: ppData.std_fax,
                    fax: ppData.fax,
                    possession: ppData.possession,
                    proofType: ppData.proof_type,
                    activities: ppData.activities,
                    hasAdditional: ppData.has_additional
                };
            }
        }

        if (tabName === 'AdditionalPlacesOfBusiness' && Object.keys(returnedData).length === 0) {
            const { data: apData, error: apErr } = await supabase
                .from('additional_places')
                .select('*')
                .eq('trn', trn)
                .single();

            if (!apErr && apData) {
                returnedData = {
                    pinCode: apData.pin_code,
                    state: apData.state,
                    district: apData.district,
                    city: apData.city,
                    locality: apData.locality,
                    road: apData.road,
                    premises: apData.premises,
                    buildingNo: apData.building_no,
                    floorNo: apData.floor_no,
                    landmark: apData.landmark,
                    latitude: apData.latitude,
                    longitude: apData.longitude,
                    email: apData.email,
                    stdTel: apData.std_tel,
                    telephone: apData.telephone,
                    mobile: apData.mobile,
                    stdFax: apData.std_fax,
                    fax: apData.fax,
                    possession: apData.possession,
                    proofType: apData.proof_type,
                    activities: apData.activities
                };
            }
        }

        if (tabName === 'StateSpecificInformation' && Object.keys(returnedData).length === 0) {
            const { data: ssData, error: ssErr } = await supabase
                .from('state_specific_info')
                .select('*')
                .eq('trn', trn)
                .single();

            if (!ssErr && ssData) {
                returnedData = {
                    ptEcNo: ssData.pt_ec_no,
                    ptRcNo: ssData.pt_rc_no,
                    exciseLicenseNo: ssData.excise_license_no,
                    exciseLicenseName: ssData.excise_license_name
                };
            }
        }

        if (tabName === 'GoodsAndServices' && Object.keys(returnedData).length === 0) {
            const { data: gsData, error: gsErr } = await supabase
                .from('goods_and_services')
                .select('*')
                .eq('trn', trn)
                .single();

            if (!gsErr && gsData) {
                returnedData = {
                    goods: gsData.goods || [],
                    services: gsData.services || []
                };
            }
        }

        if (tabName === 'AadhaarAuthentication' && Object.keys(returnedData).length === 0) {
            const { data: aaData, error: aaErr } = await supabase
                .from('aadhaar_auth')
                .select('*')
                .eq('trn', trn)
                .single();

            if (!aaErr && aaData) {
                returnedData = {
                    optForAuth: aaData.opt_for_auth
                };
            }
        }

        if (tabName === 'Verification' && Object.keys(returnedData).length === 0) {
            const { data: vData, error: vErr } = await supabase
                .from('verification')
                .select('*')
                .eq('trn', trn)
                .single();

            if (!vErr && vData) {
                returnedData = {
                    declarerName: vData.declarer_name,
                    place: vData.place,
                    designation: vData.designation,
                    verified: vData.verified
                };
            }
        }

        if (tabName === 'GSTR1_B2B_Invoices' && (!returnedData.invoices || returnedData.invoices.length === 0)) {
            const { data: invList, error: invErr } = await supabase
                .from('gstr1_b2b_invoices')
                .select('*')
                .eq('trn', trn);

            if (!invErr && invList) {
                const invoices = invList.map(inv => ({
                    recipientGSTIN: inv.recipient_gstin,
                    recipientName: inv.recipient_name,
                    invoiceNo: inv.invoice_no,
                    invoiceDate: inv.invoice_date,
                    totalInvoiceValue: inv.total_invoice_value,
                    pos: inv.pos,
                    supplyType: inv.supply_type || '',
                    isDeemedExport: inv.is_deemed_export,
                    isSEZWithPayment: inv.is_sez_with_payment,
                    isSEZWithoutPayment: inv.is_sez_without_payment,
                    isReverseCharge: inv.is_reverse_charge,
                    isIntraStateIGST: inv.is_intra_state_igst,
                    isDifferentialPercentage: inv.is_differential_percentage,
                    itemDetails: inv.tax_items || [],
                    id: inv.id // using DB uuid as local id
                }));
                returnedData = { invoices };
            }
        }

        if (tabName === 'GSTR1_B2CL_Invoices' && (!returnedData.invoices || returnedData.invoices.length === 0)) {
            const { data: invList, error: invErr } = await supabase
                .from('gstr1_b2cl_invoices')
                .select('*')
                .eq('trn', trn);

            if (!invErr && invList) {
                const invoices = invList.map(inv => ({
                    pos: inv.pos,
                    invoiceNo: inv.invoice_no,
                    invoiceDate: inv.invoice_date,
                    supplyType: inv.supply_type,
                    totalInvoiceValue: inv.total_invoice_value,
                    isDifferential: inv.is_differential,
                    itemDetails: inv.item_details,
                    id: inv.id
                }));
                returnedData = { invoices };
            }
        }

        if (tabName === 'GSTR1_Exports_Invoices' && (!returnedData.invoices || returnedData.invoices.length === 0)) {
            const { data: invList, error: invErr } = await supabase
                .from('gstr1_exports_invoices')
                .select('*')
                .eq('trn', trn);

            if (!invErr && invList) {
                const invoices = invList.map(inv => ({
                    invoiceNo: inv.invoice_no,
                    invoiceDate: inv.invoice_date,
                    portCode: inv.port_code,
                    shippingBillNo: inv.shipping_bill_no,
                    shippingBillDate: inv.shipping_bill_date,
                    totalInvoiceValue: inv.total_invoice_value,
                    supplyType: inv.supply_type,
                    gstPayment: inv.gst_payment,
                    itemDetails: inv.item_details,
                    id: inv.id
                }));
                returnedData = { invoices };
            }
        }

        if (tabName === 'GSTR1_B2CS_Invoices' && (!returnedData.invoices || returnedData.invoices.length === 0)) {
            const { data: invList, error: invErr } = await supabase
                .from('gstr1_b2cs_invoices')
                .select('*')
                .eq('trn', trn);

            if (!invErr && invList) {
                const invoices = invList.map(inv => ({
                    pos: inv.pos,
                    taxableValue: inv.taxable_value,
                    supplyType: inv.supply_type,
                    isDifferentialRate: inv.is_differential_rate,
                    rate: inv.rate,
                    id: inv.id
                }));
                returnedData = { invoices };
            }
        }

        if (tabName === 'GSTR1_NilRated_Supplies' && (!returnedData.invoices || returnedData.invoices.length === 0)) {
            const { data: invList, error: invErr } = await supabase
                .from('gstr1_nil_rated_supplies')
                .select('*')
                .eq('trn', trn);

            if (!invErr && invList && invList.length > 0) {
                const invoices = invList.map(inv => ({
                    description: inv.description,
                    nilRated: inv.nil_rated_value,
                    exempted: inv.exempted_value,
                    nonGst: inv.non_gst_value,
                    id: inv.id
                }));
                returnedData = { invoices };
            }
        }

        if (tabName === 'GSTR1_CDNR_Invoices' && (!returnedData.invoices || returnedData.invoices.length === 0)) {
            const { data: invList, error: invErr } = await supabase
                .from('gstr1_cdnr_invoices')
                .select('*')
                .eq('trn', trn);

            if (!invErr && invList) {
                const invoices = invList.map(inv => ({
                    recipientGstin: inv.recipient_gstin,
                    recipientName: inv.recipient_name,
                    nameInMaster: inv.name_in_master,
                    noteNumber: inv.note_number,
                    noteDate: inv.note_date,
                    noteType: inv.note_type,
                    noteValue: inv.note_value,
                    pos: inv.pos,
                    supplyType: inv.supply_type,
                    source: inv.source,
                    irn: inv.irn,
                    irnDate: inv.irn_date,
                    deemedExports: inv.is_deemed_export,
                    sezWithPayment: inv.is_sez_with_payment,
                    sezWithoutPayment: inv.is_sez_without_payment,
                    reverseCharge: inv.is_reverse_charge,
                    intraStateIgst: inv.is_intra_state_igst,
                    differentialRate: inv.is_differential_rate,
                    id: inv.id
                }));
                returnedData = { invoices };
            }
        }

        if (tabName === 'GSTR1_CDNUR_Invoices' && (!returnedData.invoices || returnedData.invoices.length === 0)) {
            const { data: invList, error: invErr } = await supabase
                .from('gstr1_cdnur_invoices')
                .select('*')
                .eq('trn', trn);

            if (!invErr && invList) {
                const invoices = invList.map(inv => ({
                    type: inv.unregistered_type,
                    noteNumber: inv.note_number,
                    noteDate: inv.note_date,
                    noteValue: inv.note_value,
                    noteType: inv.note_type,
                    pos: inv.pos,
                    supplyType: inv.supply_type,
                    differentialRate: inv.is_differential_rate,
                    source: inv.source,
                    irn: inv.irn,
                    irnDate: inv.irn_date,
                    taxDetails: inv.tax_details,
                    id: inv.id
                }));
                returnedData = { invoices };
            }
        }

        if (tabName === 'GSTR1_AdvTax_Invoices' && (!returnedData.records || returnedData.records.length === 0)) {
            const { data: invList, error: invErr } = await supabase
                .from('gstr1_adv_tax')
                .select('*')
                .eq('trn', trn);

            if (!invErr && invList) {
                const records = invList.map(rec => ({
                    pos: rec.pos,
                    supplyType: rec.supply_type,
                    differentialRate: rec.is_differential_rate,
                    grossAdvance: rec.gross_advance_received,
                    rate: rec.rate,
                    igst: rec.integrated_tax,
                    cgst: rec.central_tax,
                    sgst: rec.state_ut_tax,
                    cess: rec.cess,
                    id: rec.id
                }));
                returnedData = { records };
            }
        }

        if (tabName === 'GSTR1_AdjAdvances_Invoices' && (!returnedData.records || returnedData.records.length === 0)) {
            const { data: invList, error: invErr } = await supabase
                .from('gstr1_adj_advances')
                .select('*')
                .eq('trn', trn);

            if (!invErr && invList) {
                const records = invList.map(rec => ({
                    pos: rec.pos,
                    supplyType: rec.supply_type,
                    differentialRate: rec.is_differential_rate,
                    grossAdjustment: rec.gross_advance_adjusted,
                    rate: rec.rate,
                    igst: rec.integrated_tax,
                    cgst: rec.central_tax,
                    sgst: rec.state_ut_tax,
                    cess: rec.cess,
                    id: rec.id
                }));
                returnedData = { records };
            }
        }

        if ((tabName === 'GSTR1_HSN_B2B' || tabName === 'GSTR1_HSN_B2C') && (!returnedData.records || returnedData.records.length === 0)) {
            const supplyType = tabName === 'GSTR1_HSN_B2B' ? 'B2B' : 'B2C';
            const { data: hsnList, error: hsnErr } = await supabase
                .from('gstr1_hsn_summary')
                .select('*')
                .match({ trn, supply_type: supplyType });

            if (!hsnErr && hsnList) {
                const records = hsnList.map(rec => ({
                    hsn: rec.hsn,
                    description: rec.description,
                    productNameMaster: rec.product_name_master,
                    descriptionAsPerHSN: rec.description_per_hsn,
                    uqc: rec.uqc,
                    totalQuantity: rec.total_quantity,
                    totalTaxableValue: rec.total_taxable_value,
                    rate: rec.rate,
                    integratedTax: rec.integrated_tax,
                    centralTax: rec.central_tax,
                    stateTax: rec.state_tax,
                    cess: rec.cess,
                    id: rec.id
                }));
                returnedData = { records };
            }
        }

        if (tabName === 'GSTR1_Docs_Issued') {
            const { data: docList, error: docErr } = await supabase
                .from('gstr1_docs_issued')
                .select('*')
                .eq('trn', trn);

            if (!docErr && docList && docList.length > 0) {
                const documents = docList.map(doc => ({
                    category: doc.category,
                    fromSerial: doc.from_serial_no,
                    toSerial: doc.to_serial_no,
                    total: doc.total_number,
                    cancelled: doc.cancelled,
                    net: doc.net_issued,
                    id: doc.id
                }));
                returnedData = { documents };
            }
        }

        if ((tabName === 'GSTR1_ECO_TCS' || tabName === 'GSTR1_ECO_PAY') && (!returnedData.records || returnedData.records.length === 0)) {
            const ecoType = tabName === 'GSTR1_ECO_TCS' ? 'TCS' : 'PAY';
            const { data: ecoList, error: ecoErr } = await supabase
                .from('gstr1_eco_supplies')
                .select('*')
                .match({ trn, eco_type: ecoType });

            if (!ecoErr && ecoList) {
                const records = ecoList.map(rec => ({
                    gstin: rec.eco_gstin,
                    tradeName: rec.trade_name,
                    netValue: rec.net_value,
                    integratedTax: rec.integrated_tax,
                    centralTax: rec.central_tax,
                    stateTax: rec.state_tax,
                    cess: rec.cess,
                    id: rec.id
                }));
                returnedData = { records };
            }
        }

        if (tabName.startsWith('GSTR1_SUP95_') && (!returnedData.records || returnedData.records.length === 0)) {
            const tabType = tabName.replace('GSTR1_SUP95_', '');
            const { data: supList, error: supErr } = await supabase
                .from('gstr1_sup95')
                .select('*')
                .match({ trn, tab_type: tabType });

            if (!supErr && supList) {
                const records = supList.map(rec => ({
                    supplierGstin: rec.supplier_gstin,
                    supplierName: rec.supplier_name,
                    pos: rec.pos,
                    supplyType: rec.supply_type,
                    taxableValue: rec.taxable_value,
                    rate: rec.rate,
                    recipientGstin: rec.recipient_gstin,
                    recipientName: rec.recipient_name,
                    documentNumber: rec.document_number,
                    documentDate: rec.document_date,
                    totalValue: rec.total_value,
                    deemedExports: rec.is_deemed_exports,
                    sezWithPayment: rec.is_sez_with_payment,
                    sezWithoutPayment: rec.is_sez_without_payment,
                    id: rec.id
                }));
                returnedData = { records };
            }
        }

        if (Object.keys(returnedData).length === 0) {
            // Check form_submissions table fallback
            const { data: fallback, error: fbErr } = await supabase
                .from('form_submissions')
                .select('form_data')
                .match({ trn, tab_name: tabName })
                .single();

            if (!fbErr && fallback) {
                returnedData = typeof fallback.form_data === 'string' ? JSON.parse(fallback.form_data) : fallback.form_data;
            }
        }

        res.status(200).json({
            success: true,
            data: returnedData
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Reset all GSTR1 data for a TRN
// @route   DELETE /api/forms/reset/:trn
exports.resetForm = async (req, res) => {
    try {
        const { trn: rawTrn } = req.params;
        const trn = rawTrn.trim();
        console.log(`[RESET] Clearing GSTR-1 data for TRN: "${trn}"`);
        const gstr1Tables = [
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

        // 1. Delete from structured GSTR1 tables
        for (const table of gstr1Tables) {
            const { error: delErr } = await supabase.from(table).delete().eq('trn', trn);
            if (delErr) {
                console.warn(`Note: Could not clear ${table} for trn ${trn}`, delErr.message);
            }
        }

        // 2. Delete GSTR1 related submissions from form_submissions backup (Case insensitive)
        const { error: fbDelErr } = await supabase
            .from('form_submissions')
            .delete()
            .eq('trn', trn)
            .or('tab_name.ilike.GSTR1_%,tab_name.ilike.gstr1_%');

        if (fbDelErr) {
            console.warn(`Note: Could not clear form_submissions for trn ${trn}`, fbDelErr.message);
        }

        // 3. Clear from business_details.form_tabs_data (Hybrid approach cleanup)
        const { data: biz, error: bizFetchErr } = await supabase
            .from('business_details')
            .select('form_tabs_data')
            .eq('trn', trn)
            .single();

        if (!bizFetchErr && biz && biz.form_tabs_data) {
            let parsed = typeof biz.form_tabs_data === 'string' ? JSON.parse(biz.form_tabs_data) : biz.form_tabs_data;
            let keys = Object.keys(parsed);
            let cleaned = { ...parsed };
            let found = false;

            keys.forEach(key => {
                if (key.startsWith('GSTR1_') || key.toLowerCase().startsWith('gstr1_')) {
                    delete cleaned[key];
                    found = true;
                }
            });

            if (found) {
                const { error: bizUpErr } = await supabase
                    .from('business_details')
                    .update({ form_tabs_data: cleaned })
                    .eq('trn', trn);
                
                if (bizUpErr) {
                    console.warn(`Note: Could not clear business_details GSTR-1 keys for trn ${trn}`, bizUpErr.message);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: 'All GSTR-1 records have been reset successfully.'
        });
    } catch (err) {
        console.error('Reset Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get GSTR-1 Consolidated Summary
// @route   GET /api/forms/gstr1-summary/:trn
exports.getGSTR1Summary = async (req, res) => {
    try {
        const { trn } = req.params;
        const localDb = readLocalDb();

        const summary = {
            b2b: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] },
            b2bReverse: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] },
            b2cl: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] },
            exports: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] },
            sez: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] },
            deemedExports: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] },
            b2cs: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] },
            nilRated: { records: 0, value: 0, exempted: 0, nonGst: 0, invoices: [] },
            cdnr: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] },
            cdnur: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] },
            advTax: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] },
            adjAdvances: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] },
            hsn: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] },
            docs: { records: 0, invoices: [] },
            eco: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] },
            sup95: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, invoices: [] }
        };

        const getInvoicesList = (tabName) => {
            const tabData = localDb[trn]?.[tabName];
            if (!tabData) return [];
            if (Array.isArray(tabData.invoices)) return tabData.invoices;
            if (Array.isArray(tabData.records)) return tabData.records;
            if (Array.isArray(tabData.documents)) return tabData.documents;
            if (Array.isArray(tabData)) return tabData;
            return [];
        };

        // 1. B2B Invoices
        const b2bInvoices = getInvoicesList('GSTR1_B2B_Invoices');
        if (b2bInvoices.length > 0) {
            b2bInvoices.forEach(inv => {
                let val = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
                if (Array.isArray(inv.itemDetails)) {
                    inv.itemDetails.forEach(item => {
                        val += parseFloat(item.taxableValue) || 0;
                        igst += parseFloat(item.integratedTax) || 0;
                        cgst += parseFloat(item.centralTax) || 0;
                        sgst += parseFloat(item.stateTax) || 0;
                        cess += parseFloat(item.cess) || 0;
                    });
                }
                if (inv.isReverseCharge) {
                    summary.b2bReverse.records++;
                    summary.b2bReverse.value += val;
                    summary.b2bReverse.igst += igst;
                    summary.b2bReverse.cgst += cgst;
                    summary.b2bReverse.sgst += sgst;
                    summary.b2bReverse.cess += cess;
                } else if (inv.isSEZWithPayment || inv.isSEZWithoutPayment) {
                    summary.sez.records++;
                    summary.sez.value += val;
                    summary.sez.igst += igst;
                    summary.sez.cgst += cgst;
                    summary.sez.sgst += sgst;
                    summary.sez.cess += cess;
                } else if (inv.isDeemedExport) {
                    summary.deemedExports.records++;
                    summary.deemedExports.value += val;
                    summary.deemedExports.igst += igst;
                    summary.deemedExports.cgst += cgst;
                    summary.deemedExports.sgst += sgst;
                    summary.deemedExports.cess += cess;
                } else {
                    summary.b2b.records++;
                    summary.b2b.value += val;
                    summary.b2b.igst += igst;
                    summary.b2b.cgst += cgst;
                    summary.b2b.sgst += sgst;
                    summary.b2b.cess += cess;
                }
            });
        } else {
            const { data: b2bList } = await supabase.from('gstr1_b2b_invoices').select('*').eq('trn', trn);
            if (b2bList) {
                const sumItemDetails = (items) => {
                    let totals = { value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 };
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            totals.value += parseFloat(item.taxableValue || item.taxable_value || item.grossAdvance || item.gross_advance_received || item.grossAdjustment || item.gross_advance_adjusted) || 0;
                            totals.igst += parseFloat(item.integratedTax || item.integrated_tax || item.igst) || 0;
                            totals.cgst += parseFloat(item.centralTax || item.central_tax || item.cgst) || 0;
                            totals.sgst += parseFloat(item.stateTax || item.state_tax || item.sgst || item.state_ut_tax) || 0;
                            totals.cess += parseFloat(item.cess) || 0;
                        });
                    }
                    return totals;
                };
                b2bList.forEach(inv => {
                    const totals = sumItemDetails(inv.tax_items);
                    if (inv.is_reverse_charge) {
                        summary.b2bReverse.records++;
                        summary.b2bReverse.value += totals.value;
                        summary.b2bReverse.igst += totals.igst;
                        summary.b2bReverse.cgst += totals.cgst;
                        summary.b2bReverse.sgst += totals.sgst;
                        summary.b2bReverse.cess += totals.cess;
                    } else if (inv.is_sez_with_payment || inv.is_sez_without_payment) {
                        summary.sez.records++;
                        summary.sez.value += totals.value;
                        summary.sez.igst += totals.igst;
                        summary.sez.cgst += totals.cgst;
                        summary.sez.sgst += totals.sgst;
                        summary.sez.cess += totals.cess;
                    } else if (inv.is_deemed_export) {
                        summary.deemedExports.records++;
                        summary.deemedExports.value += totals.value;
                        summary.deemedExports.igst += totals.igst;
                        summary.deemedExports.cgst += totals.cgst;
                        summary.deemedExports.sgst += totals.sgst;
                        summary.deemedExports.cess += totals.cess;
                    } else {
                        summary.b2b.records++;
                        summary.b2b.value += totals.value;
                        summary.b2b.igst += totals.igst;
                        summary.b2b.cgst += totals.cgst;
                        summary.b2b.sgst += totals.sgst;
                        summary.b2b.cess += totals.cess;
                    }
                });
            }
        }

        // 2. B2CL Invoices
        const b2clInvoices = getInvoicesList('GSTR1_B2CL_Invoices');
        if (b2clInvoices.length > 0) {
            b2clInvoices.forEach(inv => {
                let val = 0, igst = 0, cess = 0;
                if (Array.isArray(inv.itemDetails)) {
                    inv.itemDetails.forEach(item => {
                        val += parseFloat(item.taxableValue) || 0;
                        igst += parseFloat(item.integratedTax) || 0;
                        cess += parseFloat(item.cess) || 0;
                    });
                }
                summary.b2cl.records++;
                summary.b2cl.value += val;
                summary.b2cl.igst += igst;
                summary.b2cl.cess += cess;
            });
        } else {
            const { data: b2clList } = await supabase.from('gstr1_b2cl_invoices').select('*').eq('trn', trn);
            if (b2clList) {
                b2clList.forEach(inv => {
                    let val = 0, igst = 0, cess = 0;
                    if (Array.isArray(inv.item_details)) {
                        inv.item_details.forEach(item => {
                            val += parseFloat(item.taxableValue) || 0;
                            igst += parseFloat(item.integratedTax) || 0;
                            cess += parseFloat(item.cess) || 0;
                        });
                    }
                    summary.b2cl.records++;
                    summary.b2cl.value += val;
                    summary.b2cl.igst += igst;
                    summary.b2cl.cess += cess;
                });
            }
        }

        // 3. Exports Invoices
        const exportsInvoices = getInvoicesList('GSTR1_Exports_Invoices');
        if (exportsInvoices.length > 0) {
            exportsInvoices.forEach(inv => {
                let val = 0, igst = 0, cess = 0;
                if (Array.isArray(inv.itemDetails)) {
                    inv.itemDetails.forEach(item => {
                        val += parseFloat(item.taxableValue) || 0;
                        igst += parseFloat(item.integratedTax) || 0;
                        cess += parseFloat(item.cess) || 0;
                    });
                }
                summary.exports.records++;
                summary.exports.value += val;
                summary.exports.igst += igst;
                summary.exports.cess += cess;
            });
        } else {
            const { data: expList } = await supabase.from('gstr1_exports_invoices').select('*').eq('trn', trn);
            if (expList) {
                expList.forEach(inv => {
                    let val = 0, igst = 0, cess = 0;
                    if (Array.isArray(inv.item_details)) {
                        inv.item_details.forEach(item => {
                            val += parseFloat(item.taxableValue) || 0;
                            igst += parseFloat(item.integratedTax) || 0;
                            cess += parseFloat(item.cess) || 0;
                        });
                    }
                    summary.exports.records++;
                    summary.exports.value += val;
                    summary.exports.igst += igst;
                    summary.exports.cess += cess;
                });
            }
        }

        // 4. B2CS Invoices
        const b2csInvoices = getInvoicesList('GSTR1_B2CS_Invoices');
        if (b2csInvoices.length > 0) {
            b2csInvoices.forEach(inv => {
                const val = parseFloat(inv.taxableValue) || 0;
                const rate = parseFloat(inv.rate) || 0;
                summary.b2cs.records++;
                summary.b2cs.value += val;
                if (inv.supplyType === 'Inter-State') {
                    summary.b2cs.igst += (val * rate) / 100;
                } else {
                    summary.b2cs.cgst += (val * rate) / 200;
                    summary.b2cs.sgst += (val * rate) / 200;
                }
            });
        } else {
            const { data: b2csList } = await supabase.from('gstr1_b2cs_invoices').select('*').eq('trn', trn);
            if (b2csList) {
                b2csList.forEach(inv => {
                    const value = parseFloat(inv.taxable_value) || 0;
                    const rate = parseFloat(inv.rate) || 0;
                    summary.b2cs.records++;
                    summary.b2cs.value += value;
                    if (inv.supply_type === 'Inter-State') {
                        summary.b2cs.igst += (value * rate) / 100;
                    } else {
                        summary.b2cs.cgst += (value * rate) / 200;
                        summary.b2cs.sgst += (value * rate) / 200;
                    }
                });
            }
        }

        // 5. Nil Rated Supplies
        const nilRatedInvoices = getInvoicesList('GSTR1_NilRated_Supplies');
        if (nilRatedInvoices.length > 0) {
            nilRatedInvoices.forEach(inv => {
                summary.nilRated.records++;
                summary.nilRated.value += parseFloat(inv.nilRated) || 0;
                summary.nilRated.exempted += parseFloat(inv.exempted) || 0;
                summary.nilRated.nonGst += parseFloat(inv.nonGst) || 0;
            });
        } else {
            const { data: nilList } = await supabase.from('gstr1_nil_rated_supplies').select('*').eq('trn', trn);
            if (nilList) {
                nilList.forEach(inv => {
                    summary.nilRated.records++;
                    summary.nilRated.value += parseFloat(inv.nil_rated_value) || 0;
                    summary.nilRated.exempted += parseFloat(inv.exempted_value) || 0;
                    summary.nilRated.nonGst += parseFloat(inv.non_gst_value) || 0;
                });
            }
        }

        // 6. CDNR Invoices
        const cdnrInvoices = getInvoicesList('GSTR1_CDNR_Invoices');
        if (cdnrInvoices.length > 0) {
            cdnrInvoices.forEach(inv => {
                let val = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
                const items = inv.itemDetails || inv.tax_items || [];
                if (Array.isArray(items)) {
                    items.forEach(item => {
                        val += parseFloat(item.taxableValue) || 0;
                        igst += parseFloat(item.integratedTax) || 0;
                        cgst += parseFloat(item.centralTax) || 0;
                        sgst += parseFloat(item.stateTax) || 0;
                        cess += parseFloat(item.cess) || 0;
                    });
                }
                summary.cdnr.records++;
                summary.cdnr.value += val || parseFloat(inv.noteValue) || 0;
                summary.cdnr.igst += igst;
                summary.cdnr.cgst += cgst;
                summary.cdnr.sgst += sgst;
                summary.cdnr.cess += cess;
            });
        } else {
            const { data: cdnrList } = await supabase.from('gstr1_cdnr_invoices').select('*').eq('trn', trn);
            if (cdnrList) {
                cdnrList.forEach(inv => {
                    let val = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
                    const items = inv.tax_items || inv.itemDetails || [];
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            val += parseFloat(item.taxableValue || item.taxable_value) || 0;
                            igst += parseFloat(item.integratedTax || item.integrated_tax || item.igst) || 0;
                            cgst += parseFloat(item.centralTax || item.central_tax || item.cgst) || 0;
                            sgst += parseFloat(item.stateTax || item.state_tax || item.sgst || item.state_ut_tax) || 0;
                            cess += parseFloat(item.cess) || 0;
                        });
                    }
                    summary.cdnr.records++;
                    summary.cdnr.value += val || parseFloat(inv.note_value) || 0;
                    summary.cdnr.igst += igst;
                    summary.cdnr.cgst += cgst;
                    summary.cdnr.sgst += sgst;
                    summary.cdnr.cess += cess;
                });
            }
        }

        // 7. CDNUR Invoices
        const cdnurInvoices = getInvoicesList('GSTR1_CDNUR_Invoices');
        if (cdnurInvoices.length > 0) {
            cdnurInvoices.forEach(inv => {
                let val = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
                const items = inv.taxDetails || inv.tax_details || [];
                if (Array.isArray(items)) {
                    items.forEach(item => {
                        val += parseFloat(item.taxableValue) || 0;
                        igst += parseFloat(item.integratedTax) || 0;
                        cgst += parseFloat(item.centralTax) || 0;
                        sgst += parseFloat(item.stateTax) || 0;
                        cess += parseFloat(item.cess) || 0;
                    });
                }
                summary.cdnur.records++;
                summary.cdnur.value += val || parseFloat(inv.noteValue) || 0;
                summary.cdnur.igst += igst;
                summary.cdnur.cgst += cgst;
                summary.cdnur.sgst += sgst;
                summary.cdnur.cess += cess;
            });
        } else {
            const { data: cdnurList } = await supabase.from('gstr1_cdnur_invoices').select('*').eq('trn', trn);
            if (cdnurList) {
                cdnurList.forEach(inv => {
                    let val = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
                    const items = inv.tax_details || inv.taxDetails || [];
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            val += parseFloat(item.taxableValue || item.taxable_value) || 0;
                            igst += parseFloat(item.integratedTax || item.integrated_tax || item.igst) || 0;
                            cgst += parseFloat(item.centralTax || item.central_tax || item.cgst) || 0;
                            sgst += parseFloat(item.stateTax || item.state_tax || item.sgst || item.state_ut_tax) || 0;
                            cess += parseFloat(item.cess) || 0;
                        });
                    }
                    summary.cdnur.records++;
                    summary.cdnur.value += val || parseFloat(inv.note_value) || 0;
                    summary.cdnur.igst += igst;
                    summary.cdnur.cgst += cgst;
                    summary.cdnur.sgst += sgst;
                    summary.cdnur.cess += cess;
                });
            }
        }

        // 8. Adv Tax
        const advTaxInvoices = getInvoicesList('GSTR1_AdvTax_Invoices');
        if (advTaxInvoices.length > 0) {
            advTaxInvoices.forEach(inv => {
                let val = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
                const items = inv.itemDetails || [];
                if (Array.isArray(items)) {
                    items.forEach(item => {
                        val += parseFloat(item.grossAdvance) || 0;
                        igst += parseFloat(item.integratedTax) || 0;
                        cgst += parseFloat(item.centralTax) || 0;
                        sgst += parseFloat(item.stateTax) || 0;
                        cess += parseFloat(item.cess) || 0;
                    });
                }
                summary.advTax.records++;
                summary.advTax.value += val;
                summary.advTax.igst += igst;
                summary.advTax.cgst += cgst;
                summary.advTax.sgst += sgst;
                summary.advTax.cess += cess;
            });
        } else {
            const { data: advList } = await supabase.from('gstr1_adv_tax').select('*').eq('trn', trn);
            if (advList) {
                advList.forEach(inv => {
                    let val = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
                    const items = inv.item_details || inv.itemDetails || [];
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            val += parseFloat(item.gross_advance_received || item.grossAdvance) || 0;
                            igst += parseFloat(item.integrated_tax || item.integratedTax || item.igst) || 0;
                            cgst += parseFloat(item.central_tax || item.centralTax || item.cgst) || 0;
                            sgst += parseFloat(item.state_tax || item.stateTax || item.sgst) || 0;
                            cess += parseFloat(item.cess) || 0;
                        });
                    }
                    summary.advTax.records++;
                    summary.advTax.value += val;
                    summary.advTax.igst += igst;
                    summary.advTax.cgst += cgst;
                    summary.advTax.sgst += sgst;
                    summary.advTax.cess += cess;
                });
            }
        }

        // 9. Adj Advances
        const adjAdvancesInvoices = getInvoicesList('GSTR1_AdjAdvances_Invoices');
        if (adjAdvancesInvoices.length > 0) {
            adjAdvancesInvoices.forEach(inv => {
                let val = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
                const items = inv.itemDetails || [];
                if (Array.isArray(items)) {
                    items.forEach(item => {
                        val += parseFloat(item.grossAdjustment) || 0;
                        igst += parseFloat(item.integratedTax) || 0;
                        cgst += parseFloat(item.centralTax) || 0;
                        sgst += parseFloat(item.stateTax) || 0;
                        cess += parseFloat(item.cess) || 0;
                    });
                }
                summary.adjAdvances.records++;
                summary.adjAdvances.value += val;
                summary.adjAdvances.igst += igst;
                summary.adjAdvances.cgst += cgst;
                summary.adjAdvances.sgst += sgst;
                summary.adjAdvances.cess += cess;
            });
        } else {
            const { data: adjList } = await supabase.from('gstr1_adj_advances').select('*').eq('trn', trn);
            if (adjList) {
                adjList.forEach(inv => {
                    let val = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
                    const items = inv.item_details || inv.itemDetails || [];
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            val += parseFloat(item.gross_advance_adjusted || item.grossAdjustment) || 0;
                            igst += parseFloat(item.integrated_tax || item.integratedTax || item.igst) || 0;
                            cgst += parseFloat(item.central_tax || item.centralTax || item.cgst) || 0;
                            sgst += parseFloat(item.state_tax || item.stateTax || item.sgst) || 0;
                            cess += parseFloat(item.cess) || 0;
                        });
                    }
                    summary.adjAdvances.records++;
                    summary.adjAdvances.value += val;
                    summary.adjAdvances.igst += igst;
                    summary.adjAdvances.cgst += cgst;
                    summary.adjAdvances.sgst += sgst;
                    summary.adjAdvances.cess += cess;
                });
            }
        }

        // 10. HSN Summary
        const hsnB2B = getInvoicesList('GSTR1_HSN_B2B');
        const hsnB2C = getInvoicesList('GSTR1_HSN_B2C');
        const allHsn = [...hsnB2B, ...hsnB2C];
        if (allHsn.length > 0) {
            allHsn.forEach(inv => {
                summary.hsn.records++;
                summary.hsn.value += parseFloat(inv.totalTaxableValue) || 0;
                summary.hsn.igst += parseFloat(inv.integratedTax) || 0;
                summary.hsn.cgst += parseFloat(inv.centralTax) || 0;
                summary.hsn.sgst += parseFloat(inv.stateTax) || 0;
                summary.hsn.cess += parseFloat(inv.cess) || 0;
            });
        } else {
            const { data: hsnList } = await supabase.from('gstr1_hsn_summary').select('*').eq('trn', trn);
            if (hsnList) {
                hsnList.forEach(inv => {
                    summary.hsn.records++;
                    summary.hsn.value += parseFloat(inv.total_taxable_value) || 0;
                    summary.hsn.igst += parseFloat(inv.integrated_tax) || 0;
                    summary.hsn.cgst += parseFloat(inv.central_tax) || 0;
                    summary.hsn.sgst += parseFloat(inv.state_tax) || 0;
                    summary.hsn.cess += parseFloat(inv.cess) || 0;
                });
            }
        }

        // 11. Documents
        const docsList = getInvoicesList('GSTR1_Docs_Issued');
        if (docsList.length > 0) {
            docsList.forEach(inv => {
                summary.docs.records += parseInt(inv.netIssued) || 0;
            });
        } else {
            const { data: docList } = await supabase.from('gstr1_docs_issued').select('*').eq('trn', trn);
            if (docList) {
                docList.forEach(inv => {
                    summary.docs.records += parseInt(inv.net_issued) || 0;
                });
            }
        }

        // 12. ECO
        const ecoTcs = getInvoicesList('GSTR1_ECO_TCS');
        const ecoPay = getInvoicesList('GSTR1_ECO_PAY');
        const allEco = [...ecoTcs, ...ecoPay];
        if (allEco.length > 0) {
            allEco.forEach(inv => {
                summary.eco.records++;
                summary.eco.value += parseFloat(inv.netValue) || 0;
                summary.eco.igst += parseFloat(inv.integratedTax) || 0;
                summary.eco.cgst += parseFloat(inv.centralTax) || 0;
                summary.eco.sgst += parseFloat(inv.stateTax) || 0;
                summary.eco.cess += parseFloat(inv.cess) || 0;
            });
        } else {
            const { data: ecoList } = await supabase.from('gstr1_eco_supplies').select('*').eq('trn', trn);
            if (ecoList) {
                ecoList.forEach(inv => {
                    summary.eco.records++;
                    summary.eco.value += parseFloat(inv.net_value) || 0;
                    summary.eco.igst += parseFloat(inv.integrated_tax) || 0;
                    summary.eco.cgst += parseFloat(inv.central_tax) || 0;
                    summary.eco.sgst += parseFloat(inv.state_tax) || 0;
                    summary.eco.cess += parseFloat(inv.cess) || 0;
                });
            }
        }

        // 13. Section 9(5)
        const sup95Tabs = ['GSTR1_SUP95_R2R', 'GSTR1_SUP95_R2NR', 'GSTR1_SUP95_NR2R', 'GSTR1_SUP95_NR2NR'];
        let hasLocalSup95 = false;
        sup95Tabs.forEach(tab => {
            const list = getInvoicesList(tab);
            if (list.length > 0) {
                hasLocalSup95 = true;
                list.forEach(inv => {
                    let val = parseFloat(inv.taxableValue) || 0;
                    let igst = parseFloat(inv.integratedTax) || 0;
                    let cgst = parseFloat(inv.centralTax) || 0;
                    let sgst = parseFloat(inv.stateTax) || 0;
                    let cess = parseFloat(inv.cess) || 0;

                    if (Array.isArray(inv.itemDetails) && inv.itemDetails.length > 0) {
                        let hasDetails = false;
                        let itemVal = 0, itemIgst = 0, itemCgst = 0, itemSgst = 0, itemCess = 0;
                        inv.itemDetails.forEach(item => {
                            if (item.taxableValue) {
                                hasDetails = true;
                                itemVal += parseFloat(item.taxableValue) || 0;
                                itemIgst += parseFloat(item.integratedTax) || 0;
                                itemCgst += parseFloat(item.centralTax) || 0;
                                itemSgst += parseFloat(item.stateTax) || 0;
                                itemCess += parseFloat(item.cess) || 0;
                            }
                        });
                        if (hasDetails) {
                            val = itemVal;
                            igst = itemIgst;
                            cgst = itemCgst;
                            sgst = itemSgst;
                            cess = itemCess;
                        }
                    }
                    summary.sup95.records++;
                    summary.sup95.value += val;
                    summary.sup95.igst += igst;
                    summary.sup95.cgst += cgst;
                    summary.sup95.sgst += sgst;
                    summary.sup95.cess += cess;
                });
            }
        });
        if (!hasLocalSup95) {
            const { data: sup95List } = await supabase.from('gstr1_sup95').select('*').eq('trn', trn);
            if (sup95List) {
                sup95List.forEach(inv => {
                    summary.sup95.records++;
                    summary.sup95.value += parseFloat(inv.taxable_value) || 0;
                    summary.sup95.igst += parseFloat(inv.integrated_tax) || 0;
                    summary.sup95.cgst += parseFloat(inv.central_tax) || 0;
                    summary.sup95.sgst += parseFloat(inv.state_tax) || 0;
                    summary.sup95.cess += parseFloat(inv.cess) || 0;
                });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                ...summary,
                rawRecords: localDb[trn] || {}
            }
        });
    } catch (err) {
        console.error('Summary Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @route   GET /api/forms/gstr1-profile/:trn
exports.getTaxpayerProfile = async (req, res) => {
    try {
        const { trn } = req.params;
        const localDb = readLocalDb();

        // 1. Attempt to fetch from business_details table in Supabase
        let bizData = null;
        try {
            const { data } = await supabase
                .from('business_details')
                .select('*')
                .eq('trn', trn)
                .single();
            if (data) bizData = data;
        } catch (e) {
            console.warn('Could not query business_details from Supabase:', e.message);
        }

        // 2. Try to fetch from users table in Supabase
        let userData = null;
        try {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('trn', trn)
                .single();
            if (data) userData = data;
        } catch (e) {
            console.warn('Could not query users from Supabase:', e.message);
        }

        // 3. Fallback to local_db.json
        const localTrnData = localDb[trn] || {};
        
        // Derive final taxpayer details
        const legalName = bizData?.legal_name || userData?.legal_name || localTrnData?.Registration?.legalName || 'D MIX MEDIA PRIVATE LIMITED';
        const tradeName = bizData?.trade_name || localTrnData?.BusinessDetails?.tradeName || '';
        const pan = bizData?.pan || userData?.pan || localTrnData?.Registration?.pan || 'AAICD8127A';
        const stateName = bizData?.state_name || userData?.state || localTrnData?.Registration?.state || 'Kerala';

        // State Codes Map
        const stateCodes = {
            'Jammu and Kashmir': '01', 'Himachal Pradesh': '02', 'Punjab': '03', 'Chandigarh': '04',
            'Uttarakhand': '05', 'Haryana': '06', 'Delhi': '07', 'Rajasthan': '08', 'Uttar Pradesh': '09',
            'Bihar': '10', 'Sikkim': '11', 'Arunachal Pradesh': '12', 'Nagaland': '13', 'Manipur': '14',
            'Mizoram': '15', 'Tripura': '16', 'Meghalaya': '17', 'Assam': '18', 'West Bengal': '19',
            'Jharkhand': '20', 'Odisha': '21', 'Chhattisgarh': '22', 'Madhya Pradesh': '23',
            'Gujarat': '24', 'Daman and Diu': '25', 'Dadra and Nagar Haveli': '26', 'Maharashtra': '27',
            'Andhra Pradesh': '28', 'Karnataka': '29', 'Goa': '30', 'Lakshadweep': '31', 'Kerala': '32',
            'Tamil Nadu': '33', 'Puducherry': '34', 'Andaman and Nicobar Islands': '35', 'Telangana': '36',
            'Andhra Pradesh (New)': '37', 'Ladakh': '38'
        };

        const stateCode = stateCodes[stateName] || '32';
        const gstin = stateCode + pan + '1Z4';

        // Format Date to DD/MM/YYYY
        const formatDate = (d) => {
            if (!d) return '';
            const date = new Date(d);
            if (isNaN(date.getTime())) return d;
            const dd = String(date.getDate()).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const yyyy = date.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        };

        // ARN and ARN Date
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const arn = `AA${stateCode}${month}${year}1234567`;
        
        let rawArnDate = bizData?.commencement_date || localTrnData?.BusinessDetails?.commencementDate || '2026-03-15';
        const arnDate = formatDate(rawArnDate);

        res.status(200).json({
            success: true,
            data: {
                gstin,
                legalName,
                tradeName,
                arn,
                arnDate,
                pan,
                stateName,
                stateCode
            }
        });
    } catch (err) {
        console.error('getTaxpayerProfile error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get GSTR-2B return summary data
// @route   GET /api/forms/gstr2b-summary/:trn
exports.getGSTR2BSummary = async (req, res) => {
    try {
        const { trn } = req.params;
        const localDb = readLocalDb();

        const summary = {
            itcAvailable: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, recordsList: [] },
            itcNotAvailable: { records: 0, value: 0, taxAmount: 0, recordsList: [] },
            debitNotes: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, recordsList: [] },
            creditNotes: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, recordsList: [] },
            importGoods: { records: 0, value: 0, igst: 0, recordsList: [] },
            importServices: { records: 0, value: 0, igst: 0, recordsList: [] }
        };

        const getRecordsList = (tabName) => {
            const tabData = localDb[trn]?.[tabName];
            if (!tabData) return [];
            if (Array.isArray(tabData.records)) return tabData.records;
            if (Array.isArray(tabData.invoices)) return tabData.invoices;
            if (Array.isArray(tabData)) return tabData;
            return [];
        };

        // 1. ITC Available
        const itcAvail = getRecordsList('GSTR2B_ITC_Available');
        summary.itcAvailable.recordsList = itcAvail;
        itcAvail.forEach(r => {
            summary.itcAvailable.records++;
            summary.itcAvailable.value += parseFloat(r.taxableValue) || 0;
            summary.itcAvailable.igst += parseFloat(r.igst) || 0;
            summary.itcAvailable.cgst += parseFloat(r.cgst) || 0;
            summary.itcAvailable.sgst += parseFloat(r.sgst) || 0;
            summary.itcAvailable.cess += parseFloat(r.cess) || 0;
        });

        // 2. ITC Not Available
        const itcNotAvail = getRecordsList('GSTR2B_ITC_Not_Available');
        summary.itcNotAvailable.recordsList = itcNotAvail;
        itcNotAvail.forEach(r => {
            summary.itcNotAvailable.records++;
            summary.itcNotAvailable.value += parseFloat(r.taxableValue) || 0;
            summary.itcNotAvailable.taxAmount += parseFloat(r.taxAmount) || 0;
        });

        // 3. Debit Notes
        const debNotes = getRecordsList('GSTR2B_Debit_Notes');
        summary.debitNotes.recordsList = debNotes;
        debNotes.forEach(r => {
            summary.debitNotes.records++;
            summary.debitNotes.value += parseFloat(r.taxableValue) || 0;
            summary.debitNotes.igst += parseFloat(r.igst) || 0;
            summary.debitNotes.cgst += parseFloat(r.cgst) || 0;
            summary.debitNotes.sgst += parseFloat(r.sgst) || 0;
            summary.debitNotes.cess += parseFloat(r.cess) || 0;
        });

        // 4. Credit Notes
        const credNotes = getRecordsList('GSTR2B_Credit_Notes');
        summary.creditNotes.recordsList = credNotes;
        credNotes.forEach(r => {
            summary.creditNotes.records++;
            summary.creditNotes.value += parseFloat(r.taxableValue) || 0;
            summary.creditNotes.igst += parseFloat(r.igst) || 0;
            summary.creditNotes.cgst += parseFloat(r.cgst) || 0;
            summary.creditNotes.sgst += parseFloat(r.sgst) || 0;
            summary.creditNotes.cess += parseFloat(r.cess) || 0;
        });

        // 5. Import Goods
        const impGoods = getRecordsList('GSTR2B_Import_Goods');
        summary.importGoods.recordsList = impGoods;
        impGoods.forEach(r => {
            summary.importGoods.records++;
            summary.importGoods.value += parseFloat(r.taxableValue) || 0;
            summary.importGoods.igst += parseFloat(r.igst) || 0;
        });

        // 6. Import Services
        const impServ = getRecordsList('GSTR2B_Import_Services');
        summary.importServices.recordsList = impServ;
        impServ.forEach(r => {
            summary.importServices.records++;
            summary.importServices.value += parseFloat(r.taxableValue) || 0;
            summary.importServices.igst += parseFloat(r.igst) || 0;
        });

        res.status(200).json({
            success: true,
            data: {
                ...summary,
                rawRecords: localDb[trn] || {}
            }
        });
    } catch (err) {
        console.error('GSTR-2B Summary Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

