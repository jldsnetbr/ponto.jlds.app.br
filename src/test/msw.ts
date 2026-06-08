import { http, HttpResponse } from 'msw';

const usuarioMock = {
  id: 'usuario-teste-id',
  email: 'teste@email.com',
  created_at: '2026-01-01T00:00:00Z',
};

const configuracoesMock = {
  id: 'config-teste-id',
  usuario_id: 'usuario-teste-id',
  inicio_expediente: '08:00:00',
  fim_expediente: '17:00:00',
  almoco_inicio: '12:00:00',
  almoco_fim: '13:00:00',
  dias_trabalho: [1, 2, 3, 4, 5],
  notificacoes_ativas: false,
  notificacao_horario: '07:30:00',
  jornada_minutos: 480,
  tolerancia_minutos: 5,
  criado_em: '2026-01-01T00:00:00Z',
  atualizado_em: '2026-01-01T00:00:00Z',
};

const pontoMock = {
  id: 'ponto-teste-id',
  usuario_id: 'usuario-teste-id',
  data: '2026-06-05',
  entrada: '2026-06-05T09:00:00Z',
  saida_almoco: null,
  retorno_almoco: null,
  saida_final: null,
  total_minutos: 0,
  saldo_minutos: -480,
  observacao: null,
  criado_em: '2026-06-05T09:00:00Z',
  atualizado_em: '2026-06-05T09:00:00Z',
};

export const handlers = [
  http.get('*/auth/v1/user', () => {
    return HttpResponse.json({ user: usuarioMock });
  }),

  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({ user: usuarioMock, session: { access_token: 'mock-token' } });
  }),

  http.get('*/rest/v1/configuracoes', ({ request }) => {
    const url = new URL(request.url);
    const usuarioId = url.searchParams.get('usuario_id');
    if (usuarioId === 'usuario-teste-id') {
      return HttpResponse.json([configuracoesMock]);
    }
    return HttpResponse.json([]);
  }),

  http.patch('*/rest/v1/configuracoes', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...configuracoesMock, ...body });
  }),

  http.get('*/rest/v1/pontos', ({ request }) => {
    const url = new URL(request.url);
    const usuarioId = url.searchParams.get('usuario_id');
    if (usuarioId === 'usuario-teste-id') {
      return HttpResponse.json([pontoMock]);
    }
    return HttpResponse.json([]);
  }),

  http.post('*/rest/v1/pontos', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...pontoMock, ...body, id: 'novo-ponto-id' });
  }),

  http.patch('*/rest/v1/pontos', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...pontoMock, ...body });
  }),

  http.get('*/rest/v1/feriados', () => {
    return HttpResponse.json([]);
  }),

  http.post('*/rest/v1/feriados', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...body, id: 'feriado-teste-id', nacional: false });
  }),

  http.delete('*/rest/v1/feriados', () => {
    return HttpResponse.json({});
  }),
];

export { usuarioMock, configuracoesMock, pontoMock };