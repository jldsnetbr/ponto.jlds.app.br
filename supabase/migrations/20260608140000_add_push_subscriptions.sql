-- Tabela para armazenar inscrições de push notification
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, endpoint)
);

-- RLS: usuário só acessa suas próprias inscrições
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario gerencia suas inscricoes" ON public.push_subscriptions
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) = usuario_id)
  WITH CHECK ((select auth.uid()) = usuario_id);

-- Índice para busca por usuario_id
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_usuario_id ON public.push_subscriptions (usuario_id);
