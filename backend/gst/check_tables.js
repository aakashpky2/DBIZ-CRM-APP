require('dotenv').config();
const supabase = require('./config/supabase');

const tables = [
    'users',
    'master_user_types',
    'taxpayer_temporary_ids',
    'composition_taxpayers',
    'gst_statistics',
    'gst_statistics_reports',
    'hsn_codes',
    'gst_practitioners',
    'gst_law_links',
    'cause_list',
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
    'gstr1_sup95',
    'forgot_otps',
    'gstr2b_b2b_invoices',
    'gstr2b_credit_debit_notes',
    'gstr2b_amended_b2b_invoices',
    'gstr2b_amended_credit_debit_notes'
];

async function checkAllTables() {
    console.log('--- Starting Database Table Check ---\n');
    let successCount = 0;
    let failedCount = 0;

    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.log(`[FAILED] Table '${table}': ${error.message}`);
                failedCount++;
            } else {
                console.log(`[OK] Table '${table}' is accessible. (Rows found: ${data.length})`);
                successCount++;
            }
        } catch (e) {
            console.log(`[ERROR] Table '${table}': ${e.message}`);
            failedCount++;
        }
    }

    console.log(`\n--- Summary ---`);
    console.log(`Total Tables Checked: ${tables.length}`);
    console.log(`Working: ${successCount}`);
    console.log(`Failed: ${failedCount}`);
}

checkAllTables();
