import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

describe('Card', () => {
  it('renderiza children', () => {
    render(<Card>Conteúdo do card</Card>);
    expect(screen.getByText('Conteúdo do card')).toBeInTheDocument();
  });

  it('tem classes base corretas', () => {
    render(<Card>Teste</Card>);
    const card = screen.getByText('Teste').closest('div');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('shadow-sm');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('border-gray-100');
    expect(card).toHaveClass('p-4');
  });

  it('não tem role button quando sem onClick', () => {
    render(<Card>Teste</Card>);
    const card = screen.getByText('Teste').closest('div');
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabIndex');
  });

  it('adiciona role button quando onClick passado', () => {
    render(<Card onClick={() => {}}>Teste</Card>);
    const card = screen.getByText('Teste').closest('div');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveClass('active:bg-gray-50');
  });

  it('chama onClick quando clicado', async () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Teste</Card>);
    await userEvent.click(screen.getByText('Teste'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('chama onClick quando Enter pressionado', async () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Teste</Card>);
    const card = screen.getByText('Teste').closest('div');
    card?.focus();
    await userEvent.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('chama onClick quando Space pressionado', async () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Teste</Card>);
    const card = screen.getByText('Teste').closest('div');
    card?.focus();
    await userEvent.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('não chama onClick quando tecla diferente pressionada', async () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Teste</Card>);
    const card = screen.getByText('Teste').closest('div');
    await userEvent.keyboard('{Tab}');
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('aplica classe customizada', () => {
    render(<Card className="custom-class">Teste</Card>);
    const card = screen.getByText('Teste').closest('div');
    expect(card).toHaveClass('custom-class');
  });

  it('renderiza children complexos', () => {
    render(
      <Card>
        <h3>Título</h3>
        <p>Descrição</p>
      </Card>
    );
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Descrição')).toBeInTheDocument();
  });
});