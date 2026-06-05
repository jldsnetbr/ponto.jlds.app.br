import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { entrar, cadastrar } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !senha) {
      setErro('Preencha todos os campos');
      return;
    }

    if (mode === 'register' && senha !== confirmSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      setErro('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    setCarregando(true);
    try {
      if (mode === 'login') {
        await entrar(email, senha);
      } else {
        await cadastrar(email, senha);
      }
      navigate('/ponto');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro na autenticação';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
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

          <Input
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {mode === 'register' && (
            <Input
              label="Confirmar senha"
              type="password"
              value={confirmSenha}
              onChange={(e) => setConfirmSenha(e.target.value)}
              placeholder="Repita a senha"
              autoComplete="new-password"
            />
          )}

          {erro && (
            <p className="text-sm text-red-500 text-center">{erro}</p>
          )}

          <Button type="submit" fullWidth disabled={carregando}>
            {carregando ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          {mode === 'login' ? (
            <>
              Não tem conta?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setErro(''); }}
                className="text-blue-500 font-medium"
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setErro(''); }}
                className="text-blue-500 font-medium"
              >
                Faça login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
