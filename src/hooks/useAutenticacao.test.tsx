import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthPage } from '@/pages/AuthPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { BrowserRouter } from 'react-router-dom';
import { ProvedorAutenticacao } from './useAutenticacao';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ProvedorAutenticacao>{children}</ProvedorAutenticacao>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('AuthPage', () => {
  it('renderiza tela de login', () => {
    render(<AuthPage />, { wrapper });
    expect(screen.getByText('Controle de Ponto')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /receber link de acesso/i })).toBeInTheDocument();
  });

  it('mostra erro quando email vazio', async () => {
    render(<AuthPage />, { wrapper });
    await userEvent.click(screen.getByRole('button', { name: /receber link de acesso/i }));
    expect(screen.getByText('Preencha o email')).toBeInTheDocument();
  });

  it('envia link magico e mostra sucesso', async () => {
    render(<AuthPage />, { wrapper });
    await userEvent.type(screen.getByLabelText('Email'), 'test@email.com');
    await userEvent.click(screen.getByRole('button', { name: /receber link de acesso/i }));

    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@email.com',
      options: { emailRedirectTo: expect.stringContaining('/') },
    });
    expect(await screen.findByText('Verifique seu email e clique no link para entrar.')).toBeInTheDocument();
  });
});
