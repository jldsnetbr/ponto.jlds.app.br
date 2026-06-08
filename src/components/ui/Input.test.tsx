import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renderiza label e input', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('associa label ao input via htmlFor', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    const label = screen.getByText('Email');
    expect(input).toHaveAttribute('id');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('permite id customizado', () => {
    render(<Input label="Email" id="email-custom" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('id', 'email-custom');
  });

  it('aplica classe de erro quando error prop passado', () => {
    render(<Input label="Email" error="Email inválido" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveClass('border-red-500');
    expect(screen.getByRole('alert')).toHaveTextContent('Email inválido');
  });

  it('define aria-invalid quando error', () => {
    render(<Input label="Email" error="Email inválido" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('define aria-describedby quando error', () => {
    render(<Input label="Email" error="Email inválido" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('não define aria-invalid quando sem error', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('chama onChange quando valor muda', async () => {
    const handleChange = vi.fn();
    render(<Input label="Email" onChange={handleChange} />);
    await userEvent.type(screen.getByLabelText('Email'), 'teste@email.com');
    expect(handleChange).toHaveBeenCalled();
  });

  it('passa props adicionais para input', () => {
    render(<Input label="Email" placeholder="seu@email.com" autoComplete="email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('placeholder', 'seu@email.com');
    expect(input).toHaveAttribute('autoComplete', 'email');
  });

  it('aplica classe customizada', () => {
    render(<Input label="Email" className="custom-class" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveClass('custom-class');
  });
});