import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthPage } from '@/pages/AuthPage'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza tela de login', () => {
    render(<AuthPage />, { wrapper })
    expect(screen.getByText('Controle de Ponto')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /receber link de acesso/i })).toBeInTheDocument()
  })

  it('mostra erro quando email vazio', async () => {
    render(<AuthPage />, { wrapper })
    await userEvent.click(screen.getByRole('button', { name: /receber link de acesso/i }))
    expect(screen.getByText('Preencha o email')).toBeInTheDocument()
  })

  it('envia link magico e mostra sucesso', async () => {
    render(<AuthPage />, { wrapper })
    await userEvent.type(screen.getByLabelText('Email'), 'test@email.com')
    await userEvent.click(screen.getByRole('button', { name: /receber link de acesso/i }))

    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@email.com',
      options: { emailRedirectTo: expect.stringContaining('/') },
    })
    expect(await screen.findByText('Verifique seu email e clique no link para entrar.')).toBeInTheDocument()
  })
})

describe('useAuth', () => {
  it('retorna usuario quando autenticado', async () => {
    const { supabase } = await import('@/lib/supabase')
    ;(supabase.auth.getSession as any).mockResolvedValueOnce({
      data: { session: { user: usuarioMock, access_token: 'token' } },
    })

    function TestComponent() {
      const { usuario } = useAuth()
      return <div data-testid="usuario">{usuario?.email || 'null'}</div>
    }

    render(<TestComponent />, { wrapper })

    await waitFor(() => {
      expect(screen.getByTestId('usuario').textContent).toBe('teste@email.com')
    })
  })
})

const usuarioMock = {
  id: 'usuario-teste-id',
  email: 'teste@email.com',
  created_at: '2026-01-01T00:00:00Z',
}
