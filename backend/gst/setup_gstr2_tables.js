/**
 * GSTR-2A & GSTR-2B Table Initializer
 * 
 * This script creates all the required GSTR-2A (dynamic) and GSTR-2B (snapshot) tables
 * in Supabase directly via the JS client.
 * 
 * Run: node backend/setup_gstr2_tables.js
 */

require('dotenv').config();
const supabase = require('./config/supabase');

const TABLES_SQL = [
    // ── GSTR-2A Tables (Dynamic / Live) ──────────────────────────────────────────

    `CREATE TABLE IF NOT EXISTS public.gstr2a_b2b_invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        supplier_trn TEXT,
        receiver_trn TEXT NOT NULL,
        supplier_gstin TEXT NOT NULL,
        receiver_gstin TEXT NOT NULL,
        supplier_name TEXT,
        invoice_number TEXT NOT NULL,
        invoice_date TEXT,
        taxable_value NUMERIC(15, 2) DEFAULT 0.00,
        rate NUMERIC(10, 2) DEFAULT 0.00,
        igst NUMERIC(15, 2) DEFAULT 0.00,
        cgst NUMERIC(15, 2) DEFAULT 0.00,
        sgst NUMERIC(15, 2) DEFAULT 0.00,
        cess NUMERIC(15, 2) DEFAULT 0.00,
        total_tax NUMERIC(15, 2) DEFAULT 0.00,
        place_of_supply TEXT,
        return_period TEXT,
        source_section TEXT DEFAULT 'B2B',
        source_gstr1_id TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        itc_eligible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(receiver_gstin, source_gstr1_id)
    )`,

    `CREATE TABLE IF NOT EXISTS public.gstr2a_credit_debit_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        supplier_trn TEXT,
        receiver_trn TEXT NOT NULL,
        supplier_gstin TEXT NOT NULL,
        receiver_gstin TEXT NOT NULL,
        supplier_name TEXT,
        note_number TEXT NOT NULL,
        note_date TEXT,
        note_type TEXT DEFAULT 'Credit',
        taxable_value NUMERIC(15, 2) DEFAULT 0.00,
        rate NUMERIC(10, 2) DEFAULT 0.00,
        igst NUMERIC(15, 2) DEFAULT 0.00,
        cgst NUMERIC(15, 2) DEFAULT 0.00,
        sgst NUMERIC(15, 2) DEFAULT 0.00,
        cess NUMERIC(15, 2) DEFAULT 0.00,
        total_tax NUMERIC(15, 2) DEFAULT 0.00,
        place_of_supply TEXT,
        return_period TEXT,
        source_section TEXT DEFAULT 'CDNR',
        source_gstr1_id TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        itc_eligible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(receiver_gstin, source_gstr1_id)
    )`,

    `CREATE TABLE IF NOT EXISTS public.gstr2a_amended_invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        supplier_trn TEXT,
        receiver_trn TEXT NOT NULL,
        supplier_gstin TEXT NOT NULL,
        receiver_gstin TEXT NOT NULL,
        supplier_name TEXT,
        invoice_number TEXT NOT NULL,
        invoice_date TEXT,
        taxable_value NUMERIC(15, 2) DEFAULT 0.00,
        rate NUMERIC(10, 2) DEFAULT 0.00,
        igst NUMERIC(15, 2) DEFAULT 0.00,
        cgst NUMERIC(15, 2) DEFAULT 0.00,
        sgst NUMERIC(15, 2) DEFAULT 0.00,
        cess NUMERIC(15, 2) DEFAULT 0.00,
        total_tax NUMERIC(15, 2) DEFAULT 0.00,
        place_of_supply TEXT,
        return_period TEXT,
        source_section TEXT DEFAULT 'B2BA',
        source_gstr1_id TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        itc_eligible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(receiver_gstin, source_gstr1_id)
    )`,

    `CREATE TABLE IF NOT EXISTS public.gstr2a_isd_invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        isd_gstin TEXT NOT NULL,
        receiver_gstin TEXT NOT NULL,
        receiver_trn TEXT NOT NULL,
        isd_document_number TEXT NOT NULL,
        isd_document_date TEXT,
        igst NUMERIC(15, 2) DEFAULT 0.00,
        cgst NUMERIC(15, 2) DEFAULT 0.00,
        sgst NUMERIC(15, 2) DEFAULT 0.00,
        cess NUMERIC(15, 2) DEFAULT 0.00,
        total_tax NUMERIC(15, 2) DEFAULT 0.00,
        return_period TEXT,
        source_gstr1_id TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(receiver_gstin, source_gstr1_id)
    )`,

    `CREATE TABLE IF NOT EXISTS public.gstr2a_tds_tcs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        deductor_gstin TEXT NOT NULL,
        receiver_gstin TEXT NOT NULL,
        receiver_trn TEXT NOT NULL,
        credit_type TEXT DEFAULT 'TDS',
        document_number TEXT,
        document_date TEXT,
        gross_value NUMERIC(15, 2) DEFAULT 0.00,
        tax_amount NUMERIC(15, 2) DEFAULT 0.00,
        return_period TEXT,
        source_gstr1_id TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(receiver_gstin, source_gstr1_id)
    )`,

    // ── GSTR-2B Tables (Static Snapshots / Locked) ──────────────────────────────

    `CREATE TABLE IF NOT EXISTS public.gstr2b_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        receiver_trn TEXT NOT NULL,
        receiver_gstin TEXT NOT NULL,
        snapshot_month INTEGER NOT NULL,
        snapshot_year INTEGER NOT NULL,
        generated_at TIMESTAMPTZ DEFAULT NOW(),
        total_taxable_value NUMERIC(15,2) DEFAULT 0.00,
        total_igst NUMERIC(15,2) DEFAULT 0.00,
        total_cgst NUMERIC(15,2) DEFAULT 0.00,
        total_sgst NUMERIC(15,2) DEFAULT 0.00,
        total_cess NUMERIC(15,2) DEFAULT 0.00,
        total_itc_available NUMERIC(15,2) DEFAULT 0.00,
        status TEXT DEFAULT 'GENERATED',
        UNIQUE(receiver_trn, snapshot_month, snapshot_year)
    )`,

    `CREATE TABLE IF NOT EXISTS public.gstr2b_b2b_invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        snapshot_id UUID REFERENCES public.gstr2b_snapshots(id),
        supplier_trn TEXT,
        receiver_trn TEXT NOT NULL,
        supplier_gstin TEXT NOT NULL,
        receiver_gstin TEXT NOT NULL,
        supplier_name TEXT,
        invoice_number TEXT NOT NULL,
        invoice_date TEXT,
        taxable_value NUMERIC(15, 2) DEFAULT 0.00,
        rate NUMERIC(10, 2) DEFAULT 0.00,
        igst NUMERIC(15, 2) DEFAULT 0.00,
        cgst NUMERIC(15, 2) DEFAULT 0.00,
        sgst NUMERIC(15, 2) DEFAULT 0.00,
        cess NUMERIC(15, 2) DEFAULT 0.00,
        total_tax NUMERIC(15, 2) DEFAULT 0.00,
        place_of_supply TEXT,
        return_period TEXT,
        source_section TEXT DEFAULT 'B2B',
        source_gstr1_id TEXT,
        snapshot_month INTEGER,
        snapshot_year INTEGER,
        itc_status TEXT DEFAULT 'AVAILABLE',
        created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS public.gstr2b_credit_debit_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        snapshot_id UUID REFERENCES public.gstr2b_snapshots(id),
        supplier_trn TEXT,
        receiver_trn TEXT NOT NULL,
        supplier_gstin TEXT NOT NULL,
        receiver_gstin TEXT NOT NULL,
        supplier_name TEXT,
        note_number TEXT NOT NULL,
        note_date TEXT,
        note_type TEXT DEFAULT 'Credit',
        taxable_value NUMERIC(15, 2) DEFAULT 0.00,
        rate NUMERIC(10, 2) DEFAULT 0.00,
        igst NUMERIC(15, 2) DEFAULT 0.00,
        cgst NUMERIC(15, 2) DEFAULT 0.00,
        sgst NUMERIC(15, 2) DEFAULT 0.00,
        cess NUMERIC(15, 2) DEFAULT 0.00,
        total_tax NUMERIC(15, 2) DEFAULT 0.00,
        place_of_supply TEXT,
        return_period TEXT,
        source_section TEXT DEFAULT 'CDNR',
        source_gstr1_id TEXT,
        snapshot_month INTEGER,
        snapshot_year INTEGER,
        itc_status TEXT DEFAULT 'AVAILABLE',
        created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS public.gstr2b_amended_invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        snapshot_id UUID REFERENCES public.gstr2b_snapshots(id),
        supplier_trn TEXT,
        receiver_trn TEXT NOT NULL,
        supplier_gstin TEXT NOT NULL,
        receiver_gstin TEXT NOT NULL,
        supplier_name TEXT,
        invoice_number TEXT NOT NULL,
        invoice_date TEXT,
        taxable_value NUMERIC(15, 2) DEFAULT 0.00,
        rate NUMERIC(10, 2) DEFAULT 0.00,
        igst NUMERIC(15, 2) DEFAULT 0.00,
        cgst NUMERIC(15, 2) DEFAULT 0.00,
        sgst NUMERIC(15, 2) DEFAULT 0.00,
        cess NUMERIC(15, 2) DEFAULT 0.00,
        total_tax NUMERIC(15, 2) DEFAULT 0.00,
        place_of_supply TEXT,
        return_period TEXT,
        source_section TEXT,
        source_gstr1_id TEXT,
        snapshot_month INTEGER,
        snapshot_year INTEGER,
        itc_status TEXT DEFAULT 'AVAILABLE',
        created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS public.gstr2b_isd_invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        snapshot_id UUID REFERENCES public.gstr2b_snapshots(id),
        isd_gstin TEXT NOT NULL,
        receiver_gstin TEXT NOT NULL,
        receiver_trn TEXT NOT NULL,
        isd_document_number TEXT,
        isd_document_date TEXT,
        igst NUMERIC(15, 2) DEFAULT 0.00,
        cgst NUMERIC(15, 2) DEFAULT 0.00,
        sgst NUMERIC(15, 2) DEFAULT 0.00,
        cess NUMERIC(15, 2) DEFAULT 0.00,
        total_tax NUMERIC(15, 2) DEFAULT 0.00,
        return_period TEXT,
        snapshot_month INTEGER,
        snapshot_year INTEGER,
        itc_status TEXT DEFAULT 'AVAILABLE',
        created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
];

const TABLE_NAMES = [
    'gstr2a_b2b_invoices',
    'gstr2a_credit_debit_notes',
    'gstr2a_amended_invoices',
    'gstr2a_isd_invoices',
    'gstr2a_tds_tcs',
    'gstr2b_snapshots',
    'gstr2b_b2b_invoices',
    'gstr2b_credit_debit_notes',
    'gstr2b_amended_invoices',
    'gstr2b_isd_invoices',
];

async function setupTables() {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║  GSTR-2A / GSTR-2B Table Setup      ║');
    console.log('╚══════════════════════════════════════╝\n');
    console.log('⚙️  Running table creation via Supabase RPC...\n');

    let created = 0, failed = 0;

    for (let i = 0; i < TABLES_SQL.length; i++) {
        const tableName = TABLE_NAMES[i];
        try {
            const { error } = await supabase.rpc('exec_sql', { sql: TABLES_SQL[i] });
            if (error) {
                // Try inserting a dummy row to see if the table already exists
                const { error: checkErr } = await supabase.from(tableName).select('id').limit(1);
                if (!checkErr) {
                    console.log(`  ✅ [EXISTS]  ${tableName}`);
                    created++;
                } else {
                    console.log(`  ⚠️  [RPC ERR] ${tableName}: ${error.message}`);
                    console.log(`     → Please run the SQL from: backend/sql/gstr2a_tables.sql manually in Supabase SQL Editor.`);
                    failed++;
                }
            } else {
                console.log(`  ✅ [CREATED] ${tableName}`);
                created++;
            }
        } catch (e) {
            console.log(`  ❌ [ERROR]   ${tableName}: ${e.message}`);
            failed++;
        }
    }

    console.log('\n── Verification ─────────────────────────────');
    for (const tableName of TABLE_NAMES) {
        const { error } = await supabase.from(tableName).select('id').limit(1);
        if (!error) {
            console.log(`  ✅ ${tableName}`);
        } else {
            console.log(`  ❌ ${tableName} - NOT ACCESSIBLE: ${error.message}`);
        }
    }

    console.log('\n─────────────────────────────────────────────');
    console.log(`  Tables Created/Verified: ${created}`);
    console.log(`  Failed/Manual Required:  ${failed}`);

    if (failed > 0) {
        console.log('\n⚠️  MANUAL STEP REQUIRED:');
        console.log('   Open Supabase Dashboard → SQL Editor');
        console.log('   Paste & run the contents of:');
        console.log('   backend/sql/gstr2a_tables.sql');
    } else {
        console.log('\n🎉 All tables ready! GSTR-2A/2B automation is active.');
    }
}

setupTables().then(() => process.exit(0)).catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
