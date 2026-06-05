import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PunchPage } from './PunchPage';
import { AllTheProviders } from '@/test/test-utils';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    usuario: { id: 'test-uid', email: 'user@email.com', criado_em: '2026-01-01T00:00:00Z' },
    carregando: false,
    entrar: vi.fn(),
    cadastrar: vi.fn(),
    sair: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTimeEntries', () => ({
  useRegistroHoje: () => ({ data: null, isLoading: false }),
  useRegistrosPonto: () => ({ data: [], isLoading: false }),
}));

vi.mock('@/hooks/usePunchMutations', () => ({
  useBaterPonto: () => ({ mutate: vi.fn(), isPending: false }),
  useRemoverBatida: () => ({ mutate: vi.fn(), isPending: false }),
  useAtualizarBatida: () => ({ mutate: vi.fn(), isPending: false }),
  useAtualizarRegistroPonto: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useSettings', () => ({
  useConfiguracoes: () => ({
    data: {
      id: 'settings-1',
      usuario_id: 'test-uid',
      inicio_expediente: '08:00:00',
      fim_expediente: '17:00:00',
      almoco_inicio: '12:00:00',
      almoco_fim: '13:00:00',
      dias_trabalho: [1, 2, 3, 4, 5],
      notificacoes_ativas: false,
      notificacao_horario: '07:30:00',
      jornada_minutos: 480,
      tolerancia_minutos: 5,
    },
    isLoading: false,
  }),
  useAtualizarConfiguracoes: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('PunchPage', () => {
  it('renderiza relógio e horário atual', () => {
    render(<PunchPage />, { wrapper: AllTheProviders });

    expect(screen.getByText('Bater Ponto')).toBeInTheDocument();
    expect(screen.getByText(/Trabalhado hoje/)).toBeInTheDocument();
  });

  it('renderiza botão de bater ponto', () => {
    render(<PunchPage />, { wrapper: AllTheProviders });

    const punchButton = screen.getByRole('button', { name: /Bater ponto/i });
    expect(punchButton).toBeInTheDocument();
  });

  it('mostra status "Nenhuma batida registrada hoje"', () => {
    render(<PunchPage />, { wrapper: AllTheProviders });

    expect(screen.getByText('Nenhuma batida registrada hoje')).toBeInTheDocument();
  });
});
