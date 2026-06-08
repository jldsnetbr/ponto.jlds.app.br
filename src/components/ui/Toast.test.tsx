import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './Toast';

function TestShowToast() {
  const { showToast } = useToast();
  return <button onClick={() => showToast('Mensagem de teste', 'success')}>Mostrar Toast</button>;
}

describe('Toast', () => {
  it('exibe toast ao chamar showToast', async () => {
    render(
      <ToastProvider>
        <TestShowToast />
      </ToastProvider>
    );

    await userEvent.click(screen.getByText('Mostrar Toast'));
    expect(screen.getByText('Mensagem de teste')).toBeInTheDocument();
  });

  it('exibe toast com cor de sucesso', async () => {
    render(
      <ToastProvider>
        <TestShowToast />
      </ToastProvider>
    );

    await userEvent.click(screen.getByText('Mostrar Toast'));
    const toast = screen.getByText('Mensagem de teste');
    expect(toast).toHaveClass('bg-emerald-600');
  });

  it('lança erro se useToast usado fora do provider', () => {
    function TestWithoutProvider() {
      useToast();
      return null;
    }

    expect(() => render(<TestWithoutProvider />)).toThrow('useToast must be used within ToastProvider');
  });
});
