import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renderiza label e input', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renderiza input do tipo email', () => {
    render(<Input label="Email" type="email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  });

  it('mostra mensagem de erro', () => {
    render(<Input label="Email" error="Email inválido" />);
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
  });

  it('não mostra erro quando não tem', () => {
    render(<Input label="Email" />);
    expect(screen.queryByText('Email inválido')).not.toBeInTheDocument();
  });

  it('chama onChange ao digitar', async () => {
    const handleChange = vi.fn();
    render(<Input label="Email" onChange={handleChange} />);
    await userEvent.type(screen.getByLabelText('Email'), 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renderiza placeholder', () => {
    render(<Input label="Email" placeholder="Digite seu email" />);
    expect(screen.getByPlaceholderText('Digite seu email')).toBeInTheDocument();
  });

  it('associa label ao input pelo htmlFor', () => {
    render(<Input label="Senha" />);
    const input = screen.getByLabelText('Senha');
    expect(input).toHaveAttribute('id', 'senha');
  });
});
