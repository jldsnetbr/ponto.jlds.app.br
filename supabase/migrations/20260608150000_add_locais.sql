-- Tabela de locais de trabalho
CREATE TABLE IF NOT EXISTS public.locais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#7c3aed',
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- RLS: usuário só acessa seus próprios locais
ALTER TABLE public.locais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario gerencia seus locais" ON public.locais
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) = usuario_id)
  WITH CHECK ((select auth.uid()) = usuario_id);

-- Índice para busca por usuario_id
CREATE INDEX IF NOT EXISTS idx_locais_usuario_id ON public.locais (usuario_id);

-- Adicionar coluna local_id na tabela pontos
ALTER TABLE public.pontos ADD COLUMN IF NOT EXISTS local_id UUID REFERENCES public.locais(id) ON DELETE SET NULL;

-- Índice para busca por local_id
CREATE INDEX IF NOT EXISTS idx_pontos_local_id ON public.pontos (local_id);
