import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import dayjs from 'dayjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PunchPage } from './PunchPage';
import { useRegistroHoje } from '@/hooks/useRegistrosPonto';
import { useBaterPonto, useAlterarPonto } from '@/hooks/useMutacoesPonto';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { AllTheProviders } from '@/test/test-utils';

// Mock hooks
vi.mock('@/hooks/useRegistrosPonto');
vi.mock('@/hooks/useMutacoesPonto');
vi.mock('@/hooks/useConfiguracoes');

const mockUseRegistroHoje = useRegistroHoje as unknown as ReturnType<typeof vi.fn>;
const mockUseBaterPonto = useBaterPonto as unknown as ReturnType<typeof vi.fn>;
const mockUseAlterarPonto = useAlterarPonto as unknown as ReturnType<typeof vi.fn>;
const mockUseConfiguracoes = useConfiguracoes as unknown as ReturnType<typeof vi.fn>;

const queryClient = new QueryClient();

describe('PunchPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Default mock implementations
    mockUseRegistroHoje.mockReturnValue({ data: null, isLoading: false });
    mockUseBaterPonto.mockReturnValue({ mutate: vi.fn(), isPending: false });
    mockUseAlterarPonto.mockReturnValue({ mutate: vi.fn(), isPending: false });
    mockUseConfiguracoes.mockReturnValue({ data: { jornada_minutos: 480 }, isLoading: false });
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <PunchPage />
      </QueryClientProvider>
    );

  it('mostra spinner enquanto carregando', () => {
    mockUseRegistroHoje.mockReturnValue({ data: null, isLoading: true });
    renderComponent();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('mostra o botão de Entrada quando não há batidas', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /bater ponto/i })).toBeInTheDocument();
    expect(screen.getByText(/próxima batida: entrada/i)).toBeInTheDocument();
  });

  it('registra entrada ao clicar no botão', async () => {
    const mockMutate = vi.fn();
    mockUseBaterPonto.mockReturnValue({ mutate: mockMutate, isPending: false });
    renderComponent();

    const horaAtual = dayjs().format('HH:mm');

    await userEvent.click(screen.getByRole('button', { name: /bater ponto/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'entrada',
          horario: expect.stringContaining(horaAtual),
        })
      );
    });
  });

  it('permite editar uma batida existente', async () => {
    const entry = {
      id: '123',
      data: '2024-01-01',
      entrada: '2024-01-01T08:00:00Z',
      saida_almoco: null,
      retorno_almoco: null,
      saida_final: null,
    };
    mockUseRegistroHoje.mockReturnValue({ data: entry, isLoading: false });
    const mockAlterarMutate = vi.fn();
    mockUseAlterarPonto.mockReturnValue({ mutate: mockAlterarMutate, isPending: false });
    renderComponent();

    await userEvent.click(screen.getByLabelText('Editar Entrada'));
    await userEvent.type(screen.getByLabelText('Horário'), '08:30');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(mockAlterarMutate).toHaveBeenCalledWith({
        id: '123',
        updates: {
          entrada: '2024-01-01T08:30:00.000Z',
        },
      });
    });
  });

  it('permite remover uma batida existente', async () => {
    const entry = {
      id: '123',
      data: '2024-01-01',
      entrada: '2024-01-01T08:00:00Z',
      saida_almoco: null,
      retorno_almoco: null,
      saida_final: null,
    };
    mockUseRegistroHoje.mockReturnValue({ data: entry, isLoading: false });
    const mockAlterarMutate = vi.fn();
    mockUseAlterarPonto.mockReturnValue({ mutate: mockAlterarMutate, isPending: false });
    renderComponent();

    await userEvent.click(screen.getByLabelText('Remover Entrada'));
    await userEvent.click(screen.getByRole('button', { name: 'Remover' }));

    await waitFor(() => {
      expect(mockAlterarMutate).toHaveBeenCalledWith({
        id: '123',
        updates: {
          entrada: null,
        },
      });
    });
  });
});
