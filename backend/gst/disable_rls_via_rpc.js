require('dotenv').config();
const supabase = require('./config/supabase');

const sqlCommands = `
ALTER TABLE public.business_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoter_partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_signatories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.additional_places DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_and_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.filing_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gstr1_b2b_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gstr1_cdnr_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gstr1_exports_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gstr2a_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gstr2b_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gst_returns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfn_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
`;

async function run() {
    console.log('Attempting to disable RLS via exec_sql RPC...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlCommands });
    if (error) {
        console.error('Error disabling RLS:', error);
    } else {
        console.log('Successfully disabled RLS via RPC!');
    }
}

run().then(() => process.exit(0));
