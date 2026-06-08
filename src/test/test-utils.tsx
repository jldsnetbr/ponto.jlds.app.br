import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProvedorAutenticacao } from '@/hooks/useAutenticacao';
import { vi } from 'vitest';

// Mock useAuth
vi.mock('@/hooks/useAutenticacao', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAutenticacao: vi.fn(() => ({
      usuario: { id: 'test-user', email: 'test@example.com', criado_em: '2024-01-01' },
      carregando: false,
      entrar: vi.fn(),
      sair: vi.fn(),
    })),
  };
});

const queryClient = new QueryClient();

export function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProvedorAutenticacao>
        {children}
      </ProvedorAutenticacao>
    </QueryClientProvider>
  );
}

export function customRender(ui: React.ReactElement, options?: any) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

export * from '@testing-library/react';
