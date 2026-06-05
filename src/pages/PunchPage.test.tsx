import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PunchPage } from './PunchPage';
import { AllTheProviders } from '@/test/test-utils';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-uid', email: 'user@email.com', created_at: '2026-01-01T00:00:00Z' },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTimeEntries', () => ({
  useTodayEntry: () => ({ data: null, isLoading: false }),
  usePunch: () => ({ mutate: vi.fn(), isPending: false }),
  useTimeEntries: () => ({ data: [], isLoading: false }),
  useUpdateTimeEntry: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useSettings', () => ({
  useSettings: () => ({
    data: {
      id: 'settings-1',
      user_id: 'test-uid',
      work_hours_start: '08:00:00',
      work_hours_end: '17:00:00',
      lunch_break_start: '12:00:00',
      lunch_break_end: '13:00:00',
      work_days: [1, 2, 3, 4, 5],
      notifications_enabled: false,
      notification_time: '07:30:00',
      daily_workload_minutes: 480,
      tolerance_minutes: 5,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    isLoading: false,
  }),
  useUpdateSettings: () => ({ mutate: vi.fn(), isPending: false }),
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
