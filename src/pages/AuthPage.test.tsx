import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProvedorAutenticacao, useAutenticacao } from '@/hooks/useAutenticacao';
import { AuthPage } from './AuthPage';

// Mock useAuth
vi.mock('@/hooks/useAutenticacao', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAutenticacao: vi.fn(),
  };
});

const mockEntrar = vi.fn();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <ProvedorAutenticacao>
    {children}
    </ProvedorAutenticacao>
  </QueryClientProvider>
);

describe('AuthPage', () => {
  beforeEach(() => {
    // @ts-ignore
    useAutenticacao.mockReturnValue({
      usuario: null,
      carregando: false,
      entrar: mockEntrar,
      sair: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza corretamente', () => {
    render(<AuthPage />, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { name: /controle de ponto/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /receber link de acesso/i })).toBeInTheDocument();
  });

  it('exibe erro se email vazio', async () => {
    render(<AuthPage />, { wrapper: Wrapper });
    await userEvent.click(screen.getByRole('button', { name: /receber link de acesso/i }));
    expect(screen.getByText(/preencha o email/i)).toBeInTheDocument();
  });

  it('chama entrar e exibe mensagem de sucesso', async () => {
    mockEntrar.mockResolvedValue({ envioOk: true, mensagem: 'Sucesso' });
    render(<AuthPage />, { wrapper: Wrapper });

    await userEvent.type(screen.getByLabelText(/email/i), 'teste@example.com');
    await userEvent.click(screen.getByRole('button', { name: /receber link de acesso/i }));

    expect(mockEntrar).toHaveBeenCalledWith('teste@example.com');
    expect(screen.getByText(/verifique seu email e clique no link para entrar./i)).toBeInTheDocument();
  });

  it('exibe erro ao falhar entrar', async () => {
    mockEntrar.mockRejectedValue(new Error('Erro de teste'));
    render(<AuthPage />, { wrapper: Wrapper });

    await userEvent.type(screen.getByLabelText(/email/i), 'teste@example.com');
    await userEvent.click(screen.getByRole('button', { name: /receber link de acesso/i }));

    expect(mockEntrar).toHaveBeenCalledWith('teste@example.com');
    expect(screen.getByText(/erro de teste/i)).toBeInTheDocument();
  });
});
