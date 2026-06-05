import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

describe('Card', () => {
  it('renderiza children', () => {
    render(<Card>Conteúdo do card</Card>);
    expect(screen.getByText('Conteúdo do card')).toBeInTheDocument();
  });

  it('chama onClick ao clicar', async () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clique aqui</Card>);
    await userEvent.click(screen.getByText('Clique aqui'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('tem role button quando onClick existe', () => {
    render(<Card onClick={vi.fn()}>Clique</Card>);
    expect(screen.getByRole('button')).toHaveTextContent('Clique');
  });

  it('aplica className extra', () => {
    render(<Card className="extra-class">Card</Card>);
    expect(screen.getByText('Card')).toHaveClass('extra-class');
  });
});
