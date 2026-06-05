import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL não configurada');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

const sql = `
DROP POLICY IF EXISTS "Usuario gerencia seus pontos" ON pontos;
CREATE POLICY "Usuario gerencia seus pontos" ON pontos
  FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuario gerencia suas configuracoes" ON configuracoes;
CREATE POLICY "Usuario gerencia suas configuracoes" ON configuracoes
  FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuario gerencia seus feriados" ON feriados;
CREATE POLICY "Usuario gerencia seus feriados" ON feriados
  FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);
`;

try {
  await pool.query(sql);
  console.log('✓ Policies atualizadas com WITH CHECK');
} catch (err) {
  console.error('✗ Erro:', err.message);
} finally {
  await pool.end();
}
