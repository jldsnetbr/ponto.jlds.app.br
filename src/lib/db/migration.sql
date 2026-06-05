-- ========================================
-- Migration: Schema inicial pt-BR
-- Execute no Supabase SQL Editor
-- ========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configuracoes do usuario
CREATE TABLE configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  inicio_expediente TIME NOT NULL DEFAULT '08:00:00',
  fim_expediente TIME NOT NULL DEFAULT '17:00:00',
  almoco_inicio TIME NOT NULL DEFAULT '12:00:00',
  almoco_fim TIME NOT NULL DEFAULT '13:00:00',
  dias_trabalho JSONB NOT NULL DEFAULT '[1,2,3,4,5]',
  notificacoes_ativas BOOLEAN NOT NULL DEFAULT false,
  notificacao_horario TIME NOT NULL DEFAULT '07:30:00',
  jornada_minutos INTEGER NOT NULL DEFAULT 480,
  tolerancia_minutos INTEGER NOT NULL DEFAULT 5,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registros de ponto
CREATE TABLE pontos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  entrada TIMESTAMP WITH TIME ZONE,
  saida_almoco TIMESTAMP WITH TIME ZONE,
  retorno_almoco TIMESTAMP WITH TIME ZONE,
  saida_final TIMESTAMP WITH TIME ZONE,
  total_minutos INTEGER,
  saldo_minutos INTEGER,
  observacao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, data)
);

-- Feriados
CREATE TABLE feriados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  nacional BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE feriados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve suas configuracoes" ON configuracoes
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuario gerencia suas configuracoes" ON configuracoes
  FOR ALL USING (auth.uid() = usuario_id);

CREATE POLICY "Usuario ve seus pontos" ON pontos
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuario gerencia seus pontos" ON pontos
  FOR ALL USING (auth.uid() = usuario_id);

CREATE POLICY "Usuario ve feriados" ON feriados
  FOR SELECT USING (auth.uid() = usuario_id OR usuario_id IS NULL);

CREATE POLICY "Usuario gerencia seus feriados" ON feriados
  FOR ALL USING (auth.uid() = usuario_id);

-- Trigger: criar config padrao ao registrar
CREATE OR REPLACE FUNCTION public.criar_config_padrao()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.configuracoes (usuario_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER apos_criar_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.criar_config_padrao();

-- Trigger: atualizar atualizado_em
CREATE OR REPLACE FUNCTION public.atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER atualizar_config_timestamp
  BEFORE UPDATE ON configuracoes
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp();

CREATE TRIGGER atualizar_pontos_timestamp
  BEFORE UPDATE ON pontos
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp();
