import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { AuthPage } from './AuthPage';

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: vi.fn(),
  }),
}));

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza formulário de login', () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Controle de Ponto' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });

  it('alterna para modo registro', async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByText('Cadastre-se'));

    expect(screen.getByText('Criar conta')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar senha')).toBeInTheDocument();
    expect(screen.getByText('Faça login')).toBeInTheDocument();
  });

  it('mostra erro para campos vazios no login', async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByText('Entrar'));

    expect(screen.getByText('Preencha todos os campos')).toBeInTheDocument();
  });

  it('valida senha mínima de 6 caracteres no registro', async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByText('Cadastre-se'));
    await userEvent.type(screen.getByLabelText('Email'), 'test@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), '123');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), '123');
    await userEvent.click(screen.getByText('Criar conta'));

    expect(screen.getByText('Senha deve ter no mínimo 6 caracteres')).toBeInTheDocument();
  });

  it('valida que senhas coincidem no registro', async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByText('Cadastre-se'));
    await userEvent.type(screen.getByLabelText('Email'), 'test@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), '123456');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), '654321');
    await userEvent.click(screen.getByText('Criar conta'));

    expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
  });

  it('chama signIn com email e senha no login', async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText('Email'), 'user@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), '123456');
    await userEvent.click(screen.getByText('Entrar'));

    expect(mockSignIn).toHaveBeenCalledWith('user@email.com', '123456');
  });

  it('chama signUp com email e senha no registro', async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByText('Cadastre-se'));
    await userEvent.type(screen.getByLabelText('Email'), 'new@email.com');
    await userEvent.type(screen.getByLabelText('Senha'), '123456');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), '123456');
    await userEvent.click(screen.getByText('Criar conta'));

    expect(mockSignUp).toHaveBeenCalledWith('new@email.com', '123456');
  });
});
