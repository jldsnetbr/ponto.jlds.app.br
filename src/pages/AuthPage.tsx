import { useState, type FormEvent } from 'react';
import { useAutenticacao } from '@/hooks/useAutenticacao';
import { Button, Input } from '@/components/ui';

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const { entrar } = useAutenticacao();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    if (!email.trim()) {
      setErro('Preencha o email');
      return;
    }

    setCarregando(true);
    try {
      await entrar(email);
      setSucesso(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar link';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-slate-100 mb-8">
          Controle de Ponto
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
          />

          {erro && (
            <p className="text-sm text-red-400 text-center">{erro}</p>
          )}

          {sucesso && (
            <p className="text-sm text-emerald-400 text-center">
              Verifique seu email e clique no link para entrar.
            </p>
          )}

          <Button type="submit" fullWidth disabled={carregando}>
            {carregando ? 'Carregando...' : 'Receber link de acesso'}
          </Button>
        </form>
      </div>
    </div>
  );
}
