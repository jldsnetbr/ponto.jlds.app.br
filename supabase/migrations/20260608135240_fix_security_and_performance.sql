-- Item 1: Substitui funcao morta (user_settings nao existe) por trigger funcional
CREATE OR REPLACE FUNCTION public.criar_config_padrao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.configuracoes (usuario_id)
  VALUES (NEW.id)
  ON CONFLICT (usuario_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.criar_config_padrao FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_config_padrao();

-- Item 2: Revoga execucao de auto_habilitar_rls para anon/authenticated
REVOKE EXECUTE ON FUNCTION public.auto_habilitar_rls FROM PUBLIC, anon, authenticated;

-- Item 3: Fix search_path mutavel no trigger function
ALTER FUNCTION public.atualizar_timestamp SET search_path = '';

-- Item 4: Indexes nas FKs para performance
CREATE INDEX IF NOT EXISTS idx_pontos_usuario_id ON public.pontos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_feriados_usuario_id ON public.feriados (usuario_id);

-- Item 5: Otimiza RLS policies com initplan ((select auth.uid()))
DROP POLICY IF EXISTS "Usuario gerencia seus pontos" ON public.pontos;
CREATE POLICY "Usuario gerencia seus pontos" ON public.pontos
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) = usuario_id)
  WITH CHECK ((select auth.uid()) = usuario_id);

DROP POLICY IF EXISTS "Usuario gerencia suas configuracoes" ON public.configuracoes;
CREATE POLICY "Usuario gerencia suas configuracoes" ON public.configuracoes
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) = usuario_id)
  WITH CHECK ((select auth.uid()) = usuario_id);

DROP POLICY IF EXISTS "Usuario gerencia seus feriados" ON public.feriados;
CREATE POLICY "Usuario gerencia seus feriados" ON public.feriados
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) = usuario_id)
  WITH CHECK ((select auth.uid()) = usuario_id);
