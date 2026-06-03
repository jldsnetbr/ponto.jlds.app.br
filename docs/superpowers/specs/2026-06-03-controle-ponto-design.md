# Especificação de Design - App de Controle de Ponto Pessoal

**Data:** 2026-06-03
**Status:** Em revisão

## 1. Visão Geral

App de controle de ponto pessoal multi-usuário (grupo pequeno de amigos), focado em simplicidade e usabilidade mobile. Inspirado no Ponto Fácil e Punch In, com cálculo baseado na CLT brasileira.

### 1.1 Objetivos

- Permitir registro rápido de ponto com um único botão
- Calcular automaticamente horas trabalhadas e saldo (banco de horas)
- Fornecer histórico mensal com possibilidade de edição
- Funcionar como PWA em iOS e Android
- Enviar notificações de lembrete para bater ponto

### 1.2 Fora do Escopo

- Cálculos financeiros (adicional noturno, DSR, horas extras 100%)
- Funcionalidades corporativas (aprovação de gestores, relatórios para RH)
- Multi-idiomas (apenas português brasileiro)
- Integração com APIs de feriados externas (feriados gerenciados localmente)

## 2. Stack Tecnológica

### 2.1 Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Vite | 6.x | Build tool e dev server |
| React | 18.x | Biblioteca UI |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 3.x | Estilização utility-first |
| React Router | 6.x | Navegação SPA |
| dayjs | 1.x | Manipulação de datas |
| vite-plugin-pwa | 0.21.x | PWA (service worker + manifest) |
| @tanstack/react-query | 5.x | Cache e sincronização de dados |

### 2.2 Backend (Supabase)

| Serviço | Propósito |
|---------|-----------|
| Supabase Auth | Autenticação email/senha |
| PostgreSQL | Banco de dados relacional |
| Row Level Security | Isolamento de dados por usuário |

### 2.3 ORM

| Tecnologia | Propósito |
|------------|-----------|
| Drizzle ORM | Type-safe queries e migrations |
| drizzle-kit | CLI para migrations |

### 2.4 Deploy

- **Frontend:** Vercel ou Netlify
- **Backend:** Supabase Cloud

## 3. Database Schema

### 3.1 Tabela: users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 Tabela: user_settings

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  work_hours_start TIME NOT NULL DEFAULT '08:00:00',
  work_hours_end TIME NOT NULL DEFAULT '17:00:00',
  lunch_break_start TIME NOT NULL DEFAULT '12:00:00',
  lunch_break_end TIME NOT NULL DEFAULT '13:00:00',
  work_days JSONB NOT NULL DEFAULT '[1,2,3,4,5]',
  notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  notification_time TIME NOT NULL DEFAULT '07:30:00',
  daily_workload_minutes INTEGER NOT NULL DEFAULT 480,
  tolerance_minutes INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `work_days`: Array de números (0=domingo, 1=segunda, ..., 6=sábado)
- `daily_workload_minutes`: Jornada diária em minutos (padrão: 480 = 8h)
- `tolerance_minutes`: Tolerância para saldo zero (padrão: 5 minutos)

### 3.3 Tabela: time_entries

```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  entry_1 TIMESTAMP WITH TIME ZONE,
  exit_1 TIMESTAMP WITH TIME ZONE,
  entry_2 TIMESTAMP WITH TIME ZONE,
  exit_2 TIMESTAMP WITH TIME ZONE,
  total_worked_minutes INTEGER,
  balance_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

**Campos:**
- `entry_1`: Entrada (início do expediente)
- `exit_1`: Saída para almoço
- `entry_2`: Retorno do almoço
- `exit_2`: Saída final (fim do expediente)
- `total_worked_minutes`: Total trabalhado no dia (calculado e armazenado para performance)
- `balance_minutes`: Saldo do dia (calculado e armazenado: trabalhado - jornada)

**Nota:** Os campos `total_worked_minutes` e `balance_minutes` são calculados client-side após cada batida e salvos no banco para evitar recálculos constantes em consultas de histórico e banco de horas.

### 3.4 Tabela: holidays

```sql
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_national BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `user_id`: NULL para feriados nacionais (compartilhados entre todos os usuários). Nullable.
- `is_national`: Indica se é feriado nacional ou personalizado

**Nota:** Feriados nacionais são seedados inicialmente no banco e compartilhados. Usuários podem adicionar feriados personalizados (user_id preenchido).

### 3.5 Row Level Security (RLS)

Todas as tabelas terão RLS habilitado com políticas que garantem que cada usuário só acessa seus próprios dados:

```sql
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own time entries" ON time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own time entries" ON time_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view holidays" ON holidays
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage own holidays" ON holidays
  FOR ALL USING (auth.uid() = user_id);
```

## 4. Telas e Navegação

### 4.1 Estrutura de Rotas

```
/login                    → Tela de login/registro
/                         → Layout principal (autenticado)
  /bank                   → Banco de horas (esquerda)
  /punch                  → Bateria de ponto (centro) - padrão
  /history                → Histórico mensal (direita)
  /settings               → Configurações (via perfil)
```

### 4.2 Layout Principal

```
┌─────────────────────────────────┐
│  [Avatar]              [Sair]   │  ← Header (clica avatar → settings)
├─────────────────────────────────┤
│                                 │
│                                 │
│        [Conteúdo da Tela]       │
│                                 │
│                                 │
├─────────────────────────────────┤
│  [Banco]    [Ponto]  [Histórico]│  ← Bottom Navigation
└─────────────────────────────────┘
```

### 4.3 Tela: Bateria de Ponto (PunchScreen)

**Elementos:**
- Botão central grande "Bater Ponto" (mínimo 200x200px)
- Status atual: "Próxima batida: Entrada" / "Próxima batida: Saída almoço" / etc.
- Lista de horários já registrados hoje
- Contador de horas trabalhadas hoje (atualizado em tempo real)
- Indicador visual do progresso da jornada (barra de progresso)

**Comportamento:**
- Um único botão detecta automaticamente o tipo de batida:
  - 0 batidas → registra `entry_1` (Entrada)
  - 1 batida → registra `exit_1` (Saída almoço)
  - 2 batidas → registra `entry_2` (Retorno almoço)
  - 3 batidas → registra `exit_2` (Saída final)
  - 4 batidas → mostra "Jornada completa" com opção de editar
- Feedback visual/háptico ao bater ponto
- Confirmação antes de registrar se já existem batidas

### 4.4 Tela: Banco de Horas (BankScreen)

**Elementos:**
- Card grande no topo: Saldo acumulado do mês
  - Ex: "+12h 30min" (verde) ou "-3h 15min" (vermelho)
- Seletor de mês/ano
- Lista de dias do mês com:
  - Data (ex: "Seg, 03/06")
  - Total trabalhado (ex: "8h 15min")
  - Saldo do dia (ex: "+15min" ou "-5min")
- Destaque visual para dias com saldo zero (dentro da tolerância)
- Destaque para dias não trabalhados (finais de semana, feriados)

**Interações:**
- Scroll vertical na lista
- Tap em um dia → navega para detalhes no histórico

### 4.5 Tela: Histórico (HistoryScreen)

**Elementos:**
- Seletor de mês/ano
- Lista de dias do mês (cards expansíveis)
- Cada card mostra:
  - Data e dia da semana
  - Total trabalhado
  - Saldo do dia
- Ao expandir um dia:
  - Horários de cada batida registrada
  - Campos editáveis para cada horário
  - Botão "Salvar alterações"
  - Botão "Adicionar batida" (se faltou alguma)
  - Campo de notas/observações

**Interações:**
- Tap em card → expande/colapsa
- Editar horário → abre teclado numérico
- Salvar → recalcula totais e saldo

### 4.6 Tela: Configurações (SettingsScreen)

**Seções:**

**Horários:**
- Entrada (time picker)
- Início do intervalo (time picker)
- Fim do intervalo (time picker)
- Saída (time picker)

**Dias Trabalhados:**
- Checkboxes: Dom, Seg, Ter, Qua, Qui, Sex, Sáb
- Seleção múltipla

**Notificações:**
- Toggle "Ativar notificações"
- Se ativado: time picker "Horário do lembrete"
- Botão "Solicitar permissão" (se não concedida)

**Jornada:**
- Input numérico "Horas por dia" (padrão: 8)
- Input numérico "Tolerância em minutos" (padrão: 5)

**Feriados:**
- Lista de feriados personalizados do usuário
- Botão "Adicionar feriado" → abre modal com inputs: data (date picker) e nome
- Botão "Excluir" em cada feriado personalizado
- Feriados nacionais exibidos como somente leitura (não podem ser excluídos)

**Ações:**
- Botão "Salvar configurações"
- Link "Sair" (logout)

### 4.7 Tela: Autenticação (AuthScreen)

**Modo Login:**
- Input email
- Input senha
- Botão "Entrar"
- Link "Não tem conta? Cadastre-se"
- Link "Esqueceu a senha?" (futuro)

**Modo Registro:**
- Input email
- Input senha
- Input confirmar senha
- Botão "Criar conta"
- Link "Já tem conta? Faça login"

**Validações:**
- Email válido
- Senha mínima 6 caracteres
- Senhas coincidem (no registro)
- Feedback de erros (email já existe, senha incorreta, etc.)

## 5. Lógica de Cálculo

### 5.1 Cálculo da Jornada Diária

```typescript
function calculateDay(
  entry1: Date | null,
  exit1: Date | null,
  entry2: Date | null,
  exit2: Date | null,
  dailyWorkloadMinutes: number,
  toleranceMinutes: number = 5
): { totalWorkedMinutes: number; balanceMinutes: number } {
  // Período da manhã: entrada → saída almoço
  const period1 = (entry1 && exit1)
    ? dayjs(exit1).diff(dayjs(entry1), 'minute')
    : 0;

  // Período da tarde: retorno almoço → saída
  const period2 = (entry2 && exit2)
    ? dayjs(exit2).diff(dayjs(entry2), 'minute')
    : 0;

  const totalWorkedMinutes = period1 + period2;
  let balanceMinutes = totalWorkedMinutes - dailyWorkloadMinutes;

  // Aplicar tolerância
  if (Math.abs(balanceMinutes) <= toleranceMinutes) {
    balanceMinutes = 0;
  }

  return { totalWorkedMinutes, balanceMinutes };
}
```

### 5.2 Detecção Automática de Batida

```typescript
function getNextPunchType(entry: TimeEntry): PunchType | null {
  if (!entry.entry_1) return 'entry_1';
  if (!entry.exit_1) return 'exit_1';
  if (!entry.entry_2) return 'entry_2';
  if (!entry.exit_2) return 'exit_2';
  return null; // Jornada completa
}
```

### 5.3 Cálculo do Saldo Mensal

```typescript
function calculateMonthlyBalance(entries: TimeEntry[]): number {
  return entries.reduce((sum, entry) => {
    return sum + (entry.balance_minutes || 0);
  }, 0);
}
```

### 5.4 Cruzamento de Meia-Noite

- Usar timestamps completos (data + hora) em todos os cálculos
- `dayjs.diff()` lida automaticamente com diferenças entre dias
- Exemplo: entrada 22:00, saída 06:00 do dia seguinte = 8 horas (não negativo)

### 5.5 Formatação de Horas

```typescript
function formatMinutes(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-';
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  return `${sign}${hours}h ${mins.toString().padStart(2, '0')}min`;
}
```

## 6. PWA e Offline

### 6.1 Manifest

```json
{
  "name": "Controle de Ponto",
  "short_name": "Ponto",
  "description": "Controle de ponto pessoal",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 6.2 Service Worker Strategy

- **Assets estáticos (JS, CSS, imagens):** Cache-first
- **Dados da API (Supabase):** Network-first com fallback para cache
- **Offline:** App carrega, mas mostra indicador "Você está offline"
- **Sincronização:** Quando voltar online, sincroniza dados pendentes

### 6.3 Notificações

- **Permissão:** Solicitada ao ativar notificações nas configurações
- **Tipo:** Notificações locais (Notification API) agendadas via `setTimeout` quando o app está aberto
- **Limitação:** Notificações só funcionam enquanto o app está ativo no navegador; para notificações push quando o app está fechado, seria necessário Supabase Edge Functions + Push API (fora do escopo MVP)
- **Conteúdo:** "Não esqueça de bater ponto!" no horário configurado
- **Ação:** Tap na notificação → foca a janela do app
- **Alternativa MVP:** Exibir lembrete visual dentro do app (banner/toast) quando o horário configurado for atingido e o app estiver aberto

## 7. Estrutura de Arquivos

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── TimePicker.tsx
│   │   └── Toast.tsx
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   └── punch/
│       ├── PunchButton.tsx
│       ├── TodayStatus.tsx
│       └── ProgressBar.tsx
├── pages/
│   ├── AuthPage.tsx
│   ├── PunchPage.tsx
│   ├── BankPage.tsx
│   ├── HistoryPage.tsx
│   └── SettingsPage.tsx
├── lib/
│   ├── supabase.ts
│   ├── db/
│   │   ├── schema.ts
│   │   └── migrations/
│   ├── calculations.ts
│   ├── notifications.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useTimeEntries.ts
│   ├── useSettings.ts
│   └── useHolidays.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 8. Fluxo de Dados

### 8.1 Autenticação

1. Usuário faz login → Supabase Auth valida
2. Token JWT armazenado em localStorage
3. `useAuth` hook expõe `user`, `loading`, `signIn`, `signUp`, `signOut`
4. Rotas protegidas redirecionam para `/login` se não autenticado

### 8.2 Time Entries

1. `useTimeEntries` hook carrega entradas via React Query
2. Queries filtradas por `user_id` do usuário logado
3. Cache em memória com staleTime de 5 minutos
4. Mutations (criar/atualizar) invalidam cache automaticamente
5. Cálculos (total, saldo) feitos client-side após cada mudança

### 8.3 Settings

1. `useSettings` hook carrega configurações do usuário
2. Se não existir, cria registro padrão após login
3. Atualizações via mutation com optimistic updates
4. Notificações reagendadas ao mudar horário

### 8.4 Notificações

1. Usuário ativa notificações nas configurações
2. App solicita permissão do navegador (Notification API)
3. Ao abrir o app, `setTimeout` é configurado para verificar o horário do lembrete
4. Quando o horário é atingido e o app está aberto, exibe notificação local
5. Ao desativar, timers pendentes são cancelados

## 9. Considerações de UX

### 9.1 Mobile-First

- Design otimizado para telas 320px-428px de largura
- Touch targets mínimos: 44x44px (Apple HIG)
- Botão de ponto: 200x200px para fácil acesso
- Espaçamento entre elementos: mínimo 8px

### 9.2 Feedback Visual

- Loading states: skeleton screens para listas
- Toast notifications: sucesso/erro em ações
- Confirmação: modal antes de deletar ou alterações críticas
- Progress indicator: barra ao bater ponto

### 9.3 Acessibilidade

- Contraste mínimo: 4.5:1 (texto normal), 3:1 (texto grande)
- Foco visível: outline em todos elementos interativos
- Labels semânticos: todos inputs com label associado
- ARIA: roles e attributes onde necessário
- Navegação por teclado: tab order lógico

### 9.4 Performance

- Code splitting: cada tela em chunk separado
- Lazy loading: imagens e ícones carregados sob demanda
- Memoization: `useMemo` e `useCallback` para cálculos pesados
- Debounce: inputs de busca/filtro (300ms)

## 10. Considerações de Segurança

### 10.1 Autenticação

- Senhas hasheadas pelo Supabase Auth (bcrypt)
- Tokens JWT com expiração (1 hora access, 7 dias refresh)
- Refresh token rotativo
- Logout invalida todos os tokens

### 10.2 Autorização

- Row Level Security (RLS) em todas as tabelas
- Políticas garantem isolamento por `user_id`
- Queries sempre filtradas pelo usuário logado
- Sem endpoints públicos que exponham dados

### 10.3 Dados Sensíveis

- Time entries e settings são dados pessoais
- Armazenados apenas no Supabase (cloud)
- Sem logs de dados sensíveis no frontend
- HTTPS obrigatório em todas as comunicações

## 11. Testes

### 11.1 Unitários

- **Cálculos:** `calculateDay`, `calculateMonthlyBalance`, `formatMinutes`
- **Detecção de batida:** `getNextPunchType`
- **Validações:** email, senha, horários

### 11.2 Integração

- **Auth flow:** login → redirect → logout
- **CRUD time entries:** criar → ler → atualizar → deletar
- **Settings:** salvar → recarregar página → verificar persistência

### 11.3 E2E

- **Punch flow:** bater 4 pontos → verificar cálculo
- **Offline:** desligar internet → bater ponto → reconectar → verificar sync
- **Notificações:** ativar → aguardar horário → verificar notificação

## 12. Próximos Passos (Futuro)

Funcionalidades não incluídas nesta versão, mas consideradas para o futuro:

- Exportação de dados (CSV, PDF)
- Relatórios visuais (gráficos de horas por semana/mês)
- Compartilhamento de relatórios (enviar para gestor)
- Integração com calendário (Google Calendar, Outlook)
- Widgets para home screen (iOS/Android)
- Modo escuro
- Multi-idiomas
- Backup automático para cloud (Google Drive, iCloud)

## 13. Glossário

- **Batida:** Registro de horário de ponto
- **Banco de horas:** Acumulado de horas extras ou devendadas
- **Jornada:** Tempo de trabalho diário esperado
- **Tolerância:** Margem de minutos para saldo zero
- **PWA:** Progressive Web App (app web instalável)
- **RLS:** Row Level Security (segurança por linha no Supabase)

## 14. Referências

- [Supabase Docs](https://supabase.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Vite PWA Plugin](https://vite-pwa.netlify.app)
- [React Query Docs](https://tanstack.com/query/latest)
- [CLT - Consolidação das Leis do Trabalho](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm)
