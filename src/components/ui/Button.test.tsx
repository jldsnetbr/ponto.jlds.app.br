import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza botão com texto', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByRole('button', { name: /clique aqui/i })).toBeInTheDocument();
  });

  it('aplica variant primary por padrão', () => {
    render(<Button>Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-midnight-500');
    expect(button).toHaveClass('text-white');
  });

  it('aplica variant secondary', () => {
    render(<Button variant="secondary">Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-midnight-800/50');
    expect(button).toHaveClass('text-slate-200');
  });

  it('aplica variant danger', () => {
    render(<Button variant="danger">Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-700');
    expect(button).toHaveClass('text-white');
  });

  it('aplica tamanho sm', () => {
    render(<Button size="sm">Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-3');
    expect(button).toHaveClass('h-9');
    expect(button).toHaveClass('text-sm');
  });

  it('aplica tamanho lg', () => {
    render(<Button size="lg">Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-8');
    expect(button).toHaveClass('h-11');
    expect(button).toHaveClass('text-lg');
  });

  it('aplica fullWidth', () => {
    render(<Button fullWidth>Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
  });

  it('chama onClick quando clicado', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Teste</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('não chama onClick quando disabled', async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Teste</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('permite definir type submit', () => {
    render(<Button type="submit">Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
