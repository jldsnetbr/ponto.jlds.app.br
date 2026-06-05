import { createClient } from '"'"'@supabase/supabase-js'"'"';

const SUPABASE_URL = '"'"'https://sfpilqfqkuzqyswgyolx.supabase.co'"'"';
const SUPABASE_ANON_KEY = '"'"'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcGlscWZxa3V6cXlzd2d5b2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDY2OTYsImV4cCI6MjA5NjA4MjY5Nn0.jIxlzOD80bUW4rP91iX_LXQZhlaYiYV0oau7SUSrN5s'"'"';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runAudit() {
  console.log('=== AUDITORIA BACKEND SUPABASE ===\n');

  console.log('--- 1. TABELAS E COLUNAS ---');
  const { data: tables } = await supabase.rpc('execute_sql', {
    sql: `
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name IN ('pontos', 'configuracoes', 'feriados')
      ORDER BY table_name, ordinal_position;
    `
  });
  console.table(tables || []);

  console.log('\n--- 2. CONSTRAINTS ---');
  const { data: constraints } = await supabase.rpc('execute_sql', {
    sql: `
      SELECT tc.table_name, tc.constraint_name, tc.constraint_type, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public' AND tc.table_name IN ('pontos', 'configuracoes', 'feriados')
      ORDER BY tc.table_name, tc.constraint_name;
    `
  });
  console.table(constraints || []);

  console.log('\n--- 3. INDICES ---');
  const { data: indexes } = await supabase.rpc('execute_sql', {
    sql: `
      SELECT schemaname, tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename IN ('pontos', 'configuracoes', 'feriados')
      ORDER BY tablename, indexname;
    `
  });
  console.table(indexes || []);

  console.log('\n--- 4. RLS POLICIES ---');
  const { data: policies } = await supabase.rpc('execute_sql', {
    sql: `
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename IN ('pontos', 'configuracoes', 'feriados')
      ORDER BY tablename, policyname;
    `
  });
  console.table(policies || []);

  console.log('\n--- 5. TRIGGERS ---');
  const { data: triggers } = await supabase.rpc('execute_sql', {
    sql: `
      SELECT event_object_table AS table_name, trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'public' AND event_object_table IN ('pontos', 'configuracoes', 'feriados')
      ORDER BY event_object_table, trigger_name;
    `
  });
  console.table(triggers || []);

  console.log('\n--- 6. FUNCTIONS ---');
  const { data: functions } = await supabase.rpc('execute_sql', {
    sql: `
      SELECT routine_name, routine_type, data_type, routine_definition
      FROM information_schema.routines
      WHERE routine_schema = 'public' AND routine_name IN ('criar_config_padrao', 'atualizar_timestamp')
      ORDER BY routine_name;
    `
  });
  console.table(functions || []);

  console.log('\n--- 7. RLS ENABLED ---');
  const { data: rls } = await supabase.rpc('execute_sql', {
    sql: `
      SELECT schemaname, tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename IN ('pontos', 'configuracoes', 'feriados');
    `
  });
  console.table(rls || []);

  console.log('\n--- 7. CONTAGEM DE REGISTROS ---');
  const { count: countPontos } = await supabase.from('pontos').select('*', { count: 'exact', head: true });
  const { count: countConfig } = await supabase.from('configuracoes').select('*', { count: 'exact', head: true });
  const { count: countFeriados } = await supabase.from('feriados').select('*', { count: 'exact', head: true });
  console.log('pontos:', countPontos);
  console.log('configuracoes:', countConfig);
  console.log('feriados:', countFeriados);

  console.log('\n--- 8. USUARIOS (auth.users) ---');
  const { data: users } = await supabase.rpc('execute_sql', {
    sql: "SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;"
  });
  console.table(users || []);

  console.log('\n=== FIM DA AUDITORIA ===');
}

runAudit().catch(console.error);
