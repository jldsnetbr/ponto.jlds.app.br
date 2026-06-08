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
    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('p-4');
  });

  it('chama onClick quando clicado', async () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Teste</Card>);
    await userEvent.click(screen.getByText('Teste'));
    expect(handleClick).toHaveBeenCalledTimes(1);
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
