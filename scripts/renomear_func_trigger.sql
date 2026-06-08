-- Renomear função
ALTER FUNCTION public.rls_auto_enable RENAME TO auto_habilitar_rls;

-- Renomear trigger
ALTER TRIGGER update_user_settings_updated_at ON configuracoes RENAME TO atualizar_configuracoes_timestamp;