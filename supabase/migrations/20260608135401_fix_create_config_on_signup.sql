-- Recria funcao criar_config_padrao apontando para tabela correta
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
