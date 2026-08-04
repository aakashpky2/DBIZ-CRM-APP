const supabase = require('../config/supabase');

// Ensure a helper function that can execute arbitrary SQL via RPC
async function ensureExecSqlFunction() {
  const createFn = `
    CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
    RETURNS VOID LANGUAGE plpgsql AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;`;
  // Supabase RPC call to execute the function creation (ignore errors if it already exists)
  await supabase.rpc('exec_sql', { sql: createFn }).catch(() => {});
}

async function dropEcoConstraint() {
  try {
    await ensureExecSqlFunction();
    const dropSql = `ALTER TABLE public.gstr1_eco_supplies DROP CONSTRAINT IF EXISTS gstr1_eco_supplies_trn_eco_type_eco_gstin_key;`;
    await supabase.rpc('exec_sql', { sql: dropSql });
    console.log('✅ Unique constraint removed from gstr1_eco_supplies');
  } catch (err) {
    console.error('❌ Failed to drop constraint:', err);
    process.exit(1);
  }
}

dropEcoConstraint().then(() => process.exit(0));
