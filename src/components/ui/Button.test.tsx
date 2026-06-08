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
    expect(button).toHaveClass('bg-blue-500');
    expect(button).toHaveClass('text-white');
  });

  it('aplica variant secondary', () => {
    render(<Button variant="secondary">Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200');
    expect(button).toHaveClass('text-gray-800');
  });

  it('aplica variant danger', () => {
    render(<Button variant="danger">Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-500');
    expect(button).toHaveClass('text-white');
  });

  it('aplica tamanho sm', () => {
    render(<Button size="sm">Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-3');
    expect(button).toHaveClass('py-1.5');
    expect(button).toHaveClass('text-sm');
  });

  it('aplica tamanho lg', () => {
    render(<Button size="lg">Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('py-3');
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

  it('define aria-disabled quando disabled', () => {
    render(<Button disabled>Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('define type button por padrão', () => {
    render(<Button>Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('permite definir type submit', () => {
    render(<Button type="submit">Teste</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});