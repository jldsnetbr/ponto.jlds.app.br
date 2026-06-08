import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Usuario } from '@/types';

interface ContextoAutenticacao {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string) => Promise<{ envioOk: boolean; mensagem?: string }>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<ContextoAutenticacao | null>(null);

export function ProvedorAutenticacao({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUsuario({
          id: session.user.id,
          email: session.user.email!,
          criado_em: session.user.created_at!,
        });
      }
      setCarregando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUsuario({
          id: session.user.id,
          email: session.user.email!,
          criado_em: session.user.created_at!,
        });
      } else {
        setUsuario(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const entrar = async (email: string) => {
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw error;
    return { envioOk: true, mensagem: 'Verifique seu email e clique no link para entrar.' };
  };

  const sair = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAutenticacao() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAutenticacao deve ser usado dentro de ProvedorAutenticacao');
  return context;
}