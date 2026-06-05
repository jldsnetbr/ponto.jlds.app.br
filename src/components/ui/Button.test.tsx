import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza com texto', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('renderiza variante primary por padrão', () => {
    render(<Button>Ok</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');
  });

  it('renderiza variante secondary', () => {
    render(<Button variant="secondary">Ok</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');
  });

  it('renderiza variante danger', () => {
    render(<Button variant="danger">Ok</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-500');
  });

  it('chama onClick ao clicar', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    await userEvent.click(screen.getByText('Clique'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('não chama onClick quando disabled', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Clique</Button>);
    await userEvent.click(screen.getByText('Clique'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renderiza fullWidth', () => {
    render(<Button fullWidth>Ok</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('renderiza min-height de 44px (touch target)', () => {
    render(<Button>Ok</Button>);
    expect(screen.getByRole('button')).toHaveClass('min-h-[44px]');
  });
});
