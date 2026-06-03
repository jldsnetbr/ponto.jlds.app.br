# Controle de Ponto - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build PWA de controle de ponto pessoal multi-usuário com Supabase, cálculos CLT, banco de horas e notificações.

**Architecture:** React SPA (Vite) com Supabase Auth + PostgreSQL. Drizzle schema para tipos, Supabase client para queries em runtime. React Query para cache. TailwindCSS para UI.

**Tech Stack:** Vite 6, React 18, TypeScript 5, TailwindCSS 3, React Router 6, dayjs, @tanstack/react-query 5, @supabase/supabase-js, Drizzle ORM (schema only), Vitest

---

## Estrutura de Arquivos

```
src/
├── components/
│   ├── ui/                    # Componentes base reutilizáveis
│   │   ├── Button.tsx         # Botão com variantes (primary/secondary/danger)
│   │   ├── Card.tsx           # Container com sombra e borda
│   │   ├── Input.tsx          # Input com label e erro
│   │   ├── TimePicker.tsx     # Input type="time" com label
│   │   ├── Toast.tsx          # Sistema de toast (context + provider)
│   │   └── index.ts           # Barrel export
│   ├── layout/                # Layout principal do app
│   │   ├── Header.tsx         # Avatar + botão sair
│   │   ├── BottomNav.tsx      # Nav com 3 tabs (Banco/Ponto/Histórico)
│   │   └── Layout.tsx         # Header + Outlet + BottomNav
│   ├── punch/                 # Componentes da tela de ponto
│   │   ├── PunchButton.tsx    # Botão grande 200x200px
│   │   ├── TodayStatus.tsx    # Lista de batidas de hoje
│   │   └── ProgressBar.tsx    # Barra de progresso da jornada
│   └── ProtectedRoute.tsx     # Guard de rota autenticada
├── pages/
│   ├── AuthPage.tsx           # Login/registro
│   ├── PunchPage.tsx          # Tela de bater ponto
│   ├── BankPage.tsx           # Banco de horas
│   ├── HistoryPage.tsx        # Histórico mensal editável
│   └── SettingsPage.tsx       # Configurações + feriados
├── hooks/
│   ├── useAuth.tsx            # Context + hook de autenticação
│   ├── useTimeEntries.ts      # Queries/mutations de time_entries
│   ├── useSettings.ts         # Queries/mutations de user_settings
│   ├── useHolidays.ts         # Queries/mutations de holidays
│   └── useNotifications.ts    # Hook de agendamento de notificações
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema (tipos + referência)
│   │   └── migration.sql      # SQL para rodar no Supabase
│   ├── calculations.ts        # Lógica de cálculo (calculateDay, etc.)
│   ├── calculations.test.ts   # Testes dos cálculos
│   ├── notifications.ts       # Sistema de notificações locais
│   └── utils.ts               # formatMinutes, cn, etc.
├── types/
│   └── index.ts               # Interfaces TypeScript
├── test/
│   └── setup.ts               # Setup do Vitest (jestdom)
├── App.tsx                    # Rotas
├── main.tsx                   # Entry point com providers
└── index.css                  # Tailwind directives + animações
```

---

## FASE 0: Fundação (sequencial)

### Task 1: Scaffolding do Projeto

**Files:**
- Create: `package.json` (via Vite)
- Modify: `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`
- Create: `src/index.css`, `src/test/setup.ts`, `.env.example`, `.gitignore`

- [ ] **Step 1: Inicializar projeto Vite + React + TypeScript**

```bash
npm create vite@latest . -- --template react-ts
npm install
```

- [ ] **Step 2: Instalar dependências**

```bash
npm install react-router-dom @supabase/supabase-js @tanstack/react-query dayjs
npm install -D tailwindcss@3 postcss autoprefixer drizzle-kit vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Inicializar TailwindCSS**

```bash
npx tailwindcss init -p
```

- [ ] **Step 4: Configurar `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

- [ ] **Step 5: Configurar `tsconfig.json`**

Adicionar `baseUrl` e `paths` em `compilerOptions`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Configurar `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'slide-in': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 7: Criar `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 8: Criar `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 9: Criar `.env.example`**

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

- [ ] **Step 10: Criar `.env` com credenciais reais do Supabase**

Copiar `.env.example` para `.env` e preencher com URL e anon key reais.

- [ ] **Step 11: Atualizar `index.html`**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#3b82f6" />
    <title>Controle de Ponto</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 12: Limpar boilerplate do Vite**

Deletar `src/App.css`, `src/assets/react.svg`. Substituir `src/App.tsx` com placeholder:

```tsx
export default function App() {
  return <div>App</div>;
}
```

Substituir `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 13: Inicializar git e fazer primeiro commit**

```bash
git init
git add .
git commit -m "chore: inicializar projeto Vite + React + TypeScript + Tailwind"
```

- [ ] **Step 14: Verificar que o projeto roda**

```bash
npm run dev
```

Expected: Dev server roda em `http://localhost:5173` mostrando "App".

---

### Task 2: Supabase Client

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Criar `src/lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: configurar Supabase client"
```

---

### Task 3: Schema + Types + Migration SQL

**Files:**
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/migration.sql`
- Create: `src/types/index.ts`

- [ ] **Step 1: Criar `src/lib/db/schema.ts` (Drizzle schema)**

```ts
import { pgTable, uuid, varchar, timestamp, time, date, jsonb, boolean, integer, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  workHoursStart: time('work_hours_start').default('08:00:00').notNull(),
  workHoursEnd: time('work_hours_end').default('17:00:00').notNull(),
  lunchBreakStart: time('lunch_break_start').default('12:00:00').notNull(),
  lunchBreakEnd: time('lunch_break_end').default('13:00:00').notNull(),
  workDays: jsonb('work_days').default([1, 2, 3, 4, 5]).notNull(),
  notificationsEnabled: boolean('notifications_enabled').default(false).notNull(),
  notificationTime: time('notification_time').default('07:30:00').notNull(),
  dailyWorkloadMinutes: integer('daily_workload_minutes').default(480).notNull(),
  toleranceMinutes: integer('tolerance_minutes').default(5).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const timeEntries = pgTable('time_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  entry1: timestamp('entry_1', { withTimezone: true }),
  exit1: timestamp('exit_1', { withTimezone: true }),
  entry2: timestamp('entry_2', { withTimezone: true }),
  exit2: timestamp('exit_2', { withTimezone: true }),
  totalWorkedMinutes: integer('total_worked_minutes'),
  balanceMinutes: integer('balance_minutes'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const holidays = pgTable('holidays', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  isNational: boolean('is_national').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

- [ ] **Step 2: Criar `src/types/index.ts`**

```ts
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  work_hours_start: string;
  work_hours_end: string;
  lunch_break_start: string;
  lunch_break_end: string;
  work_days: number[];
  notifications_enabled: boolean;
  notification_time: string;
  daily_workload_minutes: number;
  tolerance_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  date: string;
  entry_1: string | null;
  exit_1: string | null;
  entry_2: string | null;
  exit_2: string | null;
  total_worked_minutes: number | null;
  balance_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Holiday {
  id: string;
  user_id: string | null;
  date: string;
  name: string;
  is_national: boolean;
  created_at: string;
}

export type PunchType = 'entry_1' | 'exit_1' | 'entry_2' | 'exit_2';
```

- [ ] **Step 3: Criar `src/lib/db/migration.sql`**

```sql
-- ========================================
-- Migration: Schema inicial
-- Execute no Supabase SQL Editor
-- ========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: user_settings
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

-- Tabela: time_entries
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

-- Tabela: holidays
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_national BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own time entries" ON time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own time entries" ON time_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view holidays" ON holidays
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage own holidays" ON holidays
  FOR ALL USING (auth.uid() = user_id);

-- Trigger: criar user público ao registrar via Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: criar settings padrão ao criar user
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_settings();

-- Trigger: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

- [ ] **Step 4: Rodar migration no Supabase**

Copiar o conteúdo de `src/lib/db/migration.sql` e executar no Supabase SQL Editor.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: adicionar schema, types e migration SQL"
```

---

### Task 4: Cálculos + Utils (TDD)

**Files:**
- Create: `src/lib/calculations.ts`
- Create: `src/lib/calculations.test.ts`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Escrever testes para `calculateDay`**

Criar `src/lib/calculations.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calculateDay, getNextPunchType, calculateMonthlyBalance } from './calculations';
import { formatMinutes } from './utils';

describe('calculateDay', () => {
  it('retorna 0 quando nenhuma batida existe', () => {
    const result = calculateDay(null, null, null, null, 480);
    expect(result.totalWorkedMinutes).toBe(0);
    expect(result.balanceMinutes).toBe(-480);
  });

  it('calcula apenas período da manhã', () => {
    const entry1 = new Date('2026-06-03T08:00:00');
    const exit1 = new Date('2026-06-03T12:00:00');
    const result = calculateDay(entry1, exit1, null, null, 480);
    expect(result.totalWorkedMinutes).toBe(240);
    expect(result.balanceMinutes).toBe(-240);
  });

  it('calcula jornada completa (manhã + tarde)', () => {
    const entry1 = new Date('2026-06-03T08:00:00');
    const exit1 = new Date('2026-06-03T12:00:00');
    const entry2 = new Date('2026-06-03T13:00:00');
    const exit2 = new Date('2026-06-03T17:00:00');
    const result = calculateDay(entry1, exit1, entry2, exit2, 480);
    expect(result.totalWorkedMinutes).toBe(480);
    expect(result.balanceMinutes).toBe(0);
  });

  it('calcula horas extras', () => {
    const entry1 = new Date('2026-06-03T07:45:00');
    const exit1 = new Date('2026-06-03T12:00:00');
    const entry2 = new Date('2026-06-03T13:00:00');
    const exit2 = new Date('2026-06-03T18:00:00');
    const result = calculateDay(entry1, exit1, entry2, exit2, 480);
    expect(result.totalWorkedMinutes).toBe(555);
    expect(result.balanceMinutes).toBe(75);
  });

  it('aplica tolerância - saldo dentro da tolerância vira 0', () => {
    const entry1 = new Date('2026-06-03T08:03:00');
    const exit1 = new Date('2026-06-03T12:00:00');
    const entry2 = new Date('2026-06-03T13:00:00');
    const exit2 = new Date('2026-06-03T17:00:00');
    const result = calculateDay(entry1, exit1, entry2, exit2, 480, 5);
    expect(result.totalWorkedMinutes).toBe(477);
    expect(result.balanceMinutes).toBe(0);
  });

  it('calcula corretamente com cruz de meia-noite (ambos períodos)', () => {
    const entry1 = new Date('2026-06-03T22:00:00');
    const exit1 = new Date('2026-06-04T02:00:00');
    const entry2 = new Date('2026-06-04T02:30:00');
    const exit2 = new Date('2026-06-04T06:00:00');
    const result = calculateDay(entry1, exit1, entry2, exit2, 480);
    expect(result.totalWorkedMinutes).toBe(450);
    expect(result.balanceMinutes).toBe(-30);
  });
});

describe('getNextPunchType', () => {
  it('retorna entry_1 quando nenhuma batida existe', () => {
    expect(getNextPunchType({ entry_1: null, exit_1: null, entry_2: null, exit_2: null })).toBe('entry_1');
  });

  it('retorna exit_1 quando entry_1 existe', () => {
    expect(getNextPunchType({ entry_1: '2026-06-03T08:00:00', exit_1: null, entry_2: null, exit_2: null })).toBe('exit_1');
  });

  it('retorna entry_2 quando entry_1 e exit_1 existem', () => {
    expect(getNextPunchType({ entry_1: 'x', exit_1: 'x', entry_2: null, exit_2: null })).toBe('entry_2');
  });

  it('retorna exit_2 quando entry_1, exit_1 e entry_2 existem', () => {
    expect(getNextPunchType({ entry_1: 'x', exit_1: 'x', entry_2: 'x', exit_2: null })).toBe('exit_2');
  });

  it('retorna null quando todas batidas existem', () => {
    expect(getNextPunchType({ entry_1: 'x', exit_1: 'x', entry_2: 'x', exit_2: 'x' })).toBeNull();
  });
});

describe('calculateMonthlyBalance', () => {
  it('retorna 0 para lista vazia', () => {
    expect(calculateMonthlyBalance([])).toBe(0);
  });

  it('soma saldos do mês', () => {
    const entries = [
      { balance_minutes: 15 },
      { balance_minutes: -30 },
      { balance_minutes: 0 },
      { balance_minutes: 45 },
    ];
    expect(calculateMonthlyBalance(entries as any)).toBe(30);
  });

  it('ignora entradas sem balance_minutes', () => {
    const entries = [
      { balance_minutes: 15 },
      { balance_minutes: null },
      { balance_minutes: 10 },
    ];
    expect(calculateMonthlyBalance(entries as any)).toBe(25);
  });
});

describe('formatMinutes', () => {
  it('formata minutos positivos', () => {
    expect(formatMinutes(75)).toBe('+1h 15min');
  });

  it('formata minutos negativos', () => {
    expect(formatMinutes(-90)).toBe('-1h 30min');
  });

  it('formata zero', () => {
    expect(formatMinutes(0)).toBe('+0h 00min');
  });

  it('formata apenas minutos', () => {
    expect(formatMinutes(30)).toBe('+0h 30min');
  });

  it('formata horas exatas', () => {
    expect(formatMinutes(480)).toBe('+8h 00min');
  });
});
```

- [ ] **Step 2: Rodar testes e verificar que falham**

```bash
npx vitest run src/lib/calculations.test.ts
```

Expected: FAIL - módulos não encontrados.

- [ ] **Step 3: Implementar `src/lib/calculations.ts`**

```ts
import dayjs from 'dayjs';
import type { PunchType } from '@/types';

export function calculateDay(
  entry1: Date | null,
  exit1: Date | null,
  entry2: Date | null,
  exit2: Date | null,
  dailyWorkloadMinutes: number,
  toleranceMinutes: number = 5
): { totalWorkedMinutes: number; balanceMinutes: number } {
  const period1 = (entry1 && exit1)
    ? dayjs(exit1).diff(dayjs(entry1), 'minute')
    : 0;

  const period2 = (entry2 && exit2)
    ? dayjs(exit2).diff(dayjs(entry2), 'minute')
    : 0;

  const totalWorkedMinutes = period1 + period2;
  let balanceMinutes = totalWorkedMinutes - dailyWorkloadMinutes;

  if (Math.abs(balanceMinutes) <= toleranceMinutes) {
    balanceMinutes = 0;
  }

  return { totalWorkedMinutes, balanceMinutes };
}

export function getNextPunchType(entry: {
  entry_1: string | null;
  exit_1: string | null;
  entry_2: string | null;
  exit_2: string | null;
}): PunchType | null {
  if (!entry.entry_1) return 'entry_1';
  if (!entry.exit_1) return 'exit_1';
  if (!entry.entry_2) return 'entry_2';
  if (!entry.exit_2) return 'exit_2';
  return null;
}

export function calculateMonthlyBalance(entries: { balance_minutes: number | null }[]): number {
  return entries.reduce((sum, entry) => {
    return sum + (entry.balance_minutes || 0);
  }, 0);
}
```

- [ ] **Step 4: Implementar `src/lib/utils.ts`**

```ts
export function formatMinutes(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-';
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  return `${sign}${hours}h ${mins.toString().padStart(2, '0')}min`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
```

- [ ] **Step 5: Rodar testes e verificar que passam**

```bash
npx vitest run src/lib/calculations.test.ts
```

Expected: Todos os testes passam.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: implementar cálculos de jornada e utilitários com testes"
```

---

## FASE 1: Infra UI (paralelo após Fase 0)

> **3 agentes em paralelo** - cada um cria arquivos independentes.

---

### Task 5: Componentes UI Base

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/TimePicker.tsx`
- Create: `src/components/ui/Toast.tsx`
- Create: `src/components/ui/index.ts`

- [ ] **Step 1: Criar `src/components/ui/Button.tsx`**

```tsx
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-blue-500 text-white active:bg-blue-600',
  secondary: 'bg-gray-200 text-gray-800 active:bg-gray-300',
  danger: 'bg-red-500 text-white active:bg-red-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({ variant = 'primary', size = 'md', fullWidth, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Criar `src/components/ui/Card.tsx`**

```tsx
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-100 p-4',
        onClick && 'cursor-pointer active:bg-gray-50',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Criar `src/components/ui/Input.tsx`**

```tsx
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          'rounded-lg border px-3 py-2 text-base transition-colors min-h-[44px]',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
```

- [ ] **Step 4: Criar `src/components/ui/TimePicker.tsx`**

```tsx
interface TimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function TimePicker({ label, value, onChange }: TimePickerProps) {
  const id = label.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="time"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
```

- [ ] **Step 5: Criar `src/components/ui/Toast.tsx`**

```tsx
import { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 left-4 z-50 flex flex-col gap-2 pointer-events-none sm:left-auto sm:w-80">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg text-white text-sm shadow-lg animate-slide-in pointer-events-auto ${bgColors[toast.type]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
```

- [ ] **Step 6: Criar `src/components/ui/index.ts`**

```ts
export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';
export { TimePicker } from './TimePicker';
export { ToastProvider, useToast } from './Toast';
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: adicionar componentes UI base (Button, Card, Input, TimePicker, Toast)"
```

---

### Task 6: Auth System

**Files:**
- Create: `src/hooks/useAuth.tsx`
- Create: `src/pages/AuthPage.tsx`
- Create: `src/components/ProtectedRoute.tsx`

- [ ] **Step 1: Criar `src/hooks/useAuth.tsx`**

```tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at!,
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at!,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

- [ ] **Step 2: Criar `src/pages/AuthPage.tsx`**

```tsx
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Preencha todos os campos');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      navigate('/punch');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro na autenticação';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Controle de Ponto
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {mode === 'register' && (
            <Input
              label="Confirmar senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              autoComplete="new-password"
            />
          )}

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          {mode === 'login' ? (
            <>
              Não tem conta?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className="text-blue-500 font-medium"
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="text-blue-500 font-medium"
              >
                Faça login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Criar `src/components/ProtectedRoute.tsx`**

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: adicionar sistema de autenticação (useAuth, AuthPage, ProtectedRoute)"
```

---

### Task 7: Layout + Routing

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/BottomNav.tsx`
- Create: `src/components/layout/Layout.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Criar `src/components/layout/Header.tsx`**

```tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const initial = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <button
        onClick={() => navigate('/settings')}
        className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-lg"
        aria-label="Configurações"
      >
        {initial}
      </button>
      <h1 className="text-lg font-semibold text-gray-900">Controle de Ponto</h1>
      <button
        onClick={signOut}
        className="text-sm text-gray-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Sair"
      >
        Sair
      </button>
    </header>
  );
}
```

- [ ] **Step 2: Criar `src/components/layout/BottomNav.tsx`**

```tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/bank', label: 'Banco' },
  { path: '/punch', label: 'Ponto' },
  { path: '/history', label: 'Histórico' },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-around bg-white border-t border-gray-100 px-2 pb-safe">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex flex-col items-center py-2 px-4 min-h-[44px] min-w-[44px] transition-colors',
              isActive ? 'text-blue-500' : 'text-gray-400'
            )}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 3: Criar `src/components/layout/Layout.tsx`**

```tsx
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 4: Atualizar `src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '@/pages/AuthPage';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PunchPage } from '@/pages/PunchPage';
import { BankPage } from '@/pages/BankPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/punch" replace />} />
          <Route path="/punch" element={<PunchPage />} />
          <Route path="/bank" element={<BankPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 5: Atualizar `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/ui';
import './index.css';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

- [ ] **Step 6: Criar placeholders para páginas (para App.tsx compilar)**

Criar arquivos vazios temporários:

`src/pages/PunchPage.tsx`:
```tsx
export function PunchPage() {
  return <div className="p-4">Ponto</div>;
}
```

`src/pages/BankPage.tsx`:
```tsx
export function BankPage() {
  return <div className="p-4">Banco de Horas</div>;
}
```

`src/pages/HistoryPage.tsx`:
```tsx
export function HistoryPage() {
  return <div className="p-4">Histórico</div>;
}
```

`src/pages/SettingsPage.tsx`:
```tsx
export function SettingsPage() {
  return <div className="p-4">Configurações</div>;
}
```

- [ ] **Step 7: Verificar que o app compila e navega**

```bash
npm run dev
```

Expected: App abre, redireciona para /login (não autenticado). Mostra tela de auth.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: adicionar layout principal com Header, BottomNav e routing"
```

---

## FASE 2: Features (paralelo após Fase 1)

> **4 agentes em paralelo** - cada um implementa uma tela completa.

---

### Task 8: Punch Page

**Files:**
- Create: `src/hooks/useTimeEntries.ts`
- Create: `src/hooks/useSettings.ts`
- Create: `src/components/punch/PunchButton.tsx`
- Create: `src/components/punch/TodayStatus.tsx`
- Create: `src/components/punch/ProgressBar.tsx`
- Modify: `src/pages/PunchPage.tsx`

- [ ] **Step 1: Criar `src/hooks/useSettings.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { UserSettings } from '@/types';

export function useSettings() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['settings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data as UserSettings;
    },
    enabled: !!user,
  });

  return query;
}

export function useUpdateSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user!.id)
        .select()
        .single();
      if (error) throw error;
      return data as UserSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  return mutation;
}
```

- [ ] **Step 2: Criar `src/hooks/useTimeEntries.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useSettings } from './useSettings';
import { calculateDay } from '@/lib/calculations';
import type { TimeEntry, PunchType } from '@/types';
import dayjs from 'dayjs';

export function useTimeEntries(yearMonth?: string) {
  const { user } = useAuth();

  const startDate = yearMonth
    ? dayjs(yearMonth, 'YYYY-MM').startOf('month').format('YYYY-MM-DD')
    : undefined;
  const endDate = yearMonth
    ? dayjs(yearMonth, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
    : undefined;

  return useQuery({
    queryKey: ['timeEntries', user?.id, yearMonth],
    queryFn: async () => {
      let q = supabase.from('time_entries').select('*').order('date');
      if (startDate) q = q.gte('date', startDate);
      if (endDate) q = q.lte('date', endDate);
      const { data, error } = await q;
      if (error) throw error;
      return data as TimeEntry[];
    },
    enabled: !!user,
  });
}

export function useTodayEntry() {
  const { user } = useAuth();
  const today = dayjs().format('YYYY-MM-DD');

  return useQuery({
    queryKey: ['timeEntries', user?.id, 'today'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('date', today)
        .maybeSingle();
      if (error) throw error;
      return data as TimeEntry | null;
    },
    enabled: !!user,
  });
}

export function usePunch() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const today = dayjs().format('YYYY-MM-DD');

  return useMutation({
    mutationFn: async ({ entry, punchType }: { entry: TimeEntry | null; punchType: PunchType }) => {
      const now = new Date().toISOString();

      if (!entry) {
        const { data, error } = await supabase
          .from('time_entries')
          .insert({ user_id: user!.id, date: today, [punchType]: now })
          .select()
          .single();
        if (error) throw error;
        return data as TimeEntry;
      }

      const { data, error } = await supabase
        .from('time_entries')
        .update({ [punchType]: now })
        .eq('id', entry.id)
        .select()
        .single();
      if (error) throw error;
      return data as TimeEntry;
    },
    onSuccess: (entry) => {
      if (settings) {
        const { totalWorkedMinutes, balanceMinutes } = calculateDay(
          entry.entry_1 ? new Date(entry.entry_1) : null,
          entry.exit_1 ? new Date(entry.exit_1) : null,
          entry.entry_2 ? new Date(entry.entry_2) : null,
          entry.exit_2 ? new Date(entry.exit_2) : null,
          settings.daily_workload_minutes,
          settings.tolerance_minutes
        );

        supabase
          .from('time_entries')
          .update({ total_worked_minutes: totalWorkedMinutes, balance_minutes: balanceMinutes })
          .eq('id', entry.id);
      }

      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TimeEntry> }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as TimeEntry;
    },
    onSuccess: (entry) => {
      if (settings) {
        const { totalWorkedMinutes, balanceMinutes } = calculateDay(
          entry.entry_1 ? new Date(entry.entry_1) : null,
          entry.exit_1 ? new Date(entry.exit_1) : null,
          entry.entry_2 ? new Date(entry.entry_2) : null,
          entry.exit_2 ? new Date(entry.exit_2) : null,
          settings.daily_workload_minutes,
          settings.tolerance_minutes
        );

        supabase
          .from('time_entries')
          .update({ total_worked_minutes: totalWorkedMinutes, balance_minutes: balanceMinutes })
          .eq('id', entry.id);
      }

      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
}
```

- [ ] **Step 3: Criar `src/components/punch/PunchButton.tsx`**

```tsx
import { cn } from '@/lib/utils';
import type { PunchType } from '@/types';

interface PunchButtonProps {
  nextPunchType: PunchType | null;
  onPunch: () => void;
  disabled?: boolean;
}

const punchLabels: Record<PunchType, string> = {
  entry_1: 'Entrada',
  exit_1: 'Saída Almoço',
  entry_2: 'Retorno Almoço',
  exit_2: 'Saída Final',
};

export function PunchButton({ nextPunchType, onPunch, disabled }: PunchButtonProps) {
  const isComplete = !nextPunchType;

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onPunch}
        disabled={isComplete || disabled}
        className={cn(
          'w-48 h-48 rounded-full font-bold text-xl text-white shadow-lg transition-all active:scale-95',
          'flex flex-col items-center justify-center gap-2',
          isComplete
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 active:bg-blue-600',
          disabled && 'opacity-50'
        )}
        aria-label={isComplete ? 'Jornada completa' : `Bater ponto: ${nextPunchType ? punchLabels[nextPunchType] : ''}`}
      >
        {isComplete ? (
          <>
            <span className="text-3xl">✓</span>
            <span>Jornada Completa</span>
          </>
        ) : (
          <>
            <span className="text-3xl">👆</span>
            <span>Bater Ponto</span>
          </>
        )}
      </button>
      {!isComplete && nextPunchType && (
        <p className="text-sm text-gray-600">
          Próxima batida: <span className="font-semibold">{punchLabels[nextPunchType]}</span>
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Criar `src/components/punch/TodayStatus.tsx`**

```tsx
import dayjs from 'dayjs';
import type { TimeEntry } from '@/types';

interface TodayStatusProps {
  entry: TimeEntry | null;
}

const punchLabels: Record<string, string> = {
  entry_1: 'Entrada',
  exit_1: 'Saída Almoço',
  entry_2: 'Retorno Almoço',
  exit_2: 'Saída Final',
};

export function TodayStatus({ entry }: TodayStatusProps) {
  if (!entry) {
    return <p className="text-sm text-gray-500 text-center">Nenhuma batida registrada hoje</p>;
  }

  const punches = [
    { key: 'entry_1', time: entry.entry_1 },
    { key: 'exit_1', time: entry.exit_1 },
    { key: 'entry_2', time: entry.entry_2 },
    { key: 'exit_2', time: entry.exit_2 },
  ].filter((p) => p.time !== null);

  return (
    <div className="flex flex-col gap-2">
      {punches.map((punch) => (
        <div key={punch.key} className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{punchLabels[punch.key]}</span>
          <span className="font-mono font-medium text-gray-900">
            {dayjs(punch.time).format('HH:mm')}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Criar `src/components/punch/ProgressBar.tsx`**

```tsx
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Progresso da jornada</span>
        <span>{Math.round(clampedProgress)}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            clampedProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Substituir `src/pages/PunchPage.tsx`**

```tsx
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useTodayEntry, usePunch } from '@/hooks/useTimeEntries';
import { useSettings } from '@/hooks/useSettings';
import { getNextPunchType, calculateDay } from '@/lib/calculations';
import { formatMinutes } from '@/lib/utils';
import { useToast } from '@/components/ui';
import { PunchButton } from '@/components/punch/PunchButton';
import { TodayStatus } from '@/components/punch/TodayStatus';
import { ProgressBar } from '@/components/punch/ProgressBar';
import { Card } from '@/components/ui';

export function PunchPage() {
  const { data: entry, isLoading } = useTodayEntry();
  const { data: settings } = useSettings();
  const punchMutation = usePunch();
  const { showToast } = useToast();
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nextPunchType = getNextPunchType(
    entry || { entry_1: null, exit_1: null, entry_2: null, exit_2: null }
  );

  const { totalWorkedMinutes } = calculateDay(
    entry?.entry_1 ? new Date(entry.entry_1) : null,
    entry?.exit_1 ? new Date(entry.exit_1) : null,
    entry?.entry_2 ? new Date(entry.entry_2) : null,
    entry?.exit_2 ? new Date(entry.exit_2) : null,
    settings?.daily_workload_minutes ?? 480
  );

  const progress = settings
    ? (totalWorkedMinutes / settings.daily_workload_minutes) * 100
    : 0;

  const handlePunch = () => {
    if (!nextPunchType) return;
    punchMutation.mutate(
      { entry: entry || null, punchType: nextPunchType },
      {
        onSuccess: () => {
          const labels: Record<string, string> = {
            entry_1: 'Entrada',
            exit_1: 'Saída Almoço',
            entry_2: 'Retorno Almoço',
            exit_2: 'Saída Final',
          };
          showToast(`${labels[nextPunchType]} registrada às ${dayjs().format('HH:mm')}`, 'success');
        },
        onError: () => {
          showToast('Erro ao registrar ponto', 'error');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="text-center">
        <p className="text-sm text-gray-500">
          {now.format('dddd, DD [de] MMMM [de] YYYY')}
        </p>
        <p className="text-4xl font-mono font-bold text-gray-900 mt-1">
          {now.format('HH:mm:ss')}
        </p>
      </div>

      <PunchButton
        nextPunchType={nextPunchType}
        onPunch={handlePunch}
        disabled={punchMutation.isPending}
      />

      <div className="w-full max-w-sm">
        <p className="text-center text-lg font-medium text-gray-900">
          Trabalhado hoje: {formatMinutes(totalWorkedMinutes)}
        </p>
      </div>

      <div className="w-full max-w-sm">
        <ProgressBar progress={progress} />
      </div>

      <Card className="w-full max-w-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Batidas de hoje</h3>
        <TodayStatus entry={entry || null} />
      </Card>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: implementar tela de bater ponto com detecção automática de batida"
```

---

### Task 9: Bank Page

**Files:**
- Modify: `src/pages/BankPage.tsx`

- [ ] **Step 1: Substituir `src/pages/BankPage.tsx`**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { calculateMonthlyBalance } from '@/lib/calculations';
import { formatMinutes } from '@/lib/utils';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function BankPage() {
  const [yearMonth, setYearMonth] = useState(dayjs().format('YYYY-MM'));
  const { data: entries, isLoading } = useTimeEntries(yearMonth);
  const navigate = useNavigate();

  const monthlyBalance = calculateMonthlyBalance(entries || []);

  const goToPrevMonth = () => {
    setYearMonth(dayjs(yearMonth, 'YYYY-MM').subtract(1, 'month').format('YYYY-MM'));
  };

  const goToNextMonth = () => {
    setYearMonth(dayjs(yearMonth, 'YYYY-MM').add(1, 'month').format('YYYY-MM'));
  };

  const monthLabel = dayjs(yearMonth, 'YYYY-MM').format('MMMM [de] YYYY');

  const daysInMonth = dayjs(yearMonth, 'YYYY-MM').daysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = dayjs(yearMonth, 'YYYY-MM').date(i + 1);
    const dateStr = date.format('YYYY-MM-DD');
    const entry = entries?.find((e) => e.date === dateStr);
    return {
      date: dateStr,
      dayOfWeek: dayNames[date.day()],
      dayNum: i + 1,
      entry,
    };
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 text-lg"
          aria-label="Mês anterior"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-gray-900 capitalize">{monthLabel}</h2>
        <button
          onClick={goToNextMonth}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 text-lg"
          aria-label="Próximo mês"
        >
          →
        </button>
      </div>

      <Card
        className={cn(
          'text-center py-6',
          monthlyBalance > 0 && 'bg-green-50 border-green-200',
          monthlyBalance < 0 && 'bg-red-50 border-red-200'
        )}
      >
        <p className="text-sm text-gray-600 mb-1">Saldo do mês</p>
        <p
          className={cn(
            'text-3xl font-bold font-mono',
            monthlyBalance > 0 && 'text-green-600',
            monthlyBalance < 0 && 'text-red-600',
            monthlyBalance === 0 && 'text-gray-600'
          )}
        >
          {formatMinutes(monthlyBalance)}
        </p>
      </Card>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {days.map((day) => {
            const balance = day.entry?.balance_minutes;
            const total = day.entry?.total_worked_minutes;
            const isZeroBalance = balance !== null && balance !== undefined && Math.abs(balance) <= 5;

            return (
              <Card
                key={day.date}
                onClick={() => {
                  if (day.entry) navigate('/history');
                }}
                className={cn(
                  'flex items-center justify-between py-3',
                  !day.entry && 'opacity-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-8">{day.dayOfWeek}</span>
                  <span className="text-sm font-medium text-gray-900 w-6">{day.dayNum}</span>
                </div>
                <div className="flex items-center gap-4">
                  {total !== null && total !== undefined ? (
                    <span className="text-sm text-gray-600 font-mono">
                      {formatMinutes(total)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                  {balance !== null && balance !== undefined ? (
                    <span
                      className={cn(
                        'text-sm font-mono font-medium w-20 text-right',
                        isZeroBalance ? 'text-gray-400' : balance > 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {isZeroBalance ? formatMinutes(0) : formatMinutes(balance)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 w-20 text-right">-</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: implementar tela de banco de horas com saldo mensal"
```

---

### Task 10: History Page

**Files:**
- Modify: `src/pages/HistoryPage.tsx`

- [ ] **Step 1: Substituir `src/pages/HistoryPage.tsx`**

```tsx
import { useState } from 'react';
import dayjs from 'dayjs';
import { useTimeEntries, useUpdateTimeEntry } from '@/hooks/useTimeEntries';
import { calculateDay } from '@/lib/calculations';
import { formatMinutes, cn } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/components/ui';
import { Card, Button, Input } from '@/components/ui';
import type { TimeEntry } from '@/types';

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function HistoryPage() {
  const [yearMonth, setYearMonth] = useState(dayjs().format('YYYY-MM'));
  const { data: entries, isLoading } = useTimeEntries(yearMonth);
  const { data: settings } = useSettings();
  const updateMutation = useUpdateTimeEntry();
  const { showToast } = useToast();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [editNotes, setEditNotes] = useState('');

  const goToPrevMonth = () => {
    setYearMonth(dayjs(yearMonth, 'YYYY-MM').subtract(1, 'month').format('YYYY-MM'));
    setExpandedDay(null);
  };

  const goToNextMonth = () => {
    setYearMonth(dayjs(yearMonth, 'YYYY-MM').add(1, 'month').format('YYYY-MM'));
    setExpandedDay(null);
  };

  const monthLabel = dayjs(yearMonth, 'YYYY-MM').format('MMMM [de] YYYY');

  const handleExpand = (entry: TimeEntry) => {
    if (expandedDay === entry.date) {
      setExpandedDay(null);
      return;
    }
    setExpandedDay(entry.date);
    setEditValues({
      entry_1: entry.entry_1 ? dayjs(entry.entry_1).format('HH:mm') : '',
      exit_1: entry.exit_1 ? dayjs(entry.exit_1).format('HH:mm') : '',
      entry_2: entry.entry_2 ? dayjs(entry.entry_2).format('HH:mm') : '',
      exit_2: entry.exit_2 ? dayjs(entry.exit_2).format('HH:mm') : '',
    });
    setEditNotes(entry.notes || '');
  };

  const handleSave = (entry: TimeEntry) => {
    const date = entry.date;
    const toISO = (time: string) => {
      if (!time) return null;
      return dayjs(`${date}T${time}`).toISOString();
    };

    const updates = {
      entry_1: toISO(editValues.entry_1),
      exit_1: toISO(editValues.exit_1),
      entry_2: toISO(editValues.entry_2),
      exit_2: toISO(editValues.exit_2),
      notes: editNotes || null,
    };

    updateMutation.mutate(
      { id: entry.id, updates },
      {
        onSuccess: () => {
          showToast('Alterações salvas', 'success');
        },
        onError: () => {
          showToast('Erro ao salvar alterações', 'error');
        },
      }
    );
  };

  const getEditedCalculation = (entry: TimeEntry) => {
    const toISO = (time: string) => {
      if (!time) return null;
      return dayjs(`${entry.date}T${time}`).toDate();
    };

    return calculateDay(
      toISO(editValues.entry_1),
      toISO(editValues.exit_1),
      toISO(editValues.entry_2),
      toISO(editValues.exit_2),
      settings?.daily_workload_minutes ?? 480,
      settings?.tolerance_minutes ?? 5
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <button onClick={goToPrevMonth} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 text-lg" aria-label="Mês anterior">←</button>
        <h2 className="text-lg font-semibold text-gray-900 capitalize">{monthLabel}</h2>
        <button onClick={goToNextMonth} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 text-lg" aria-label="Próximo mês">→</button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {(entries || []).map((entry) => {
            const isExpanded = expandedDay === entry.date;
            const date = dayjs(entry.date);
            const calc = isExpanded ? getEditedCalculation(entry) : null;

            return (
              <div key={entry.id}>
                <Card
                  onClick={() => handleExpand(entry)}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {dayNames[date.day()]}, {date.format('DD/MM')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.total_worked_minutes !== null ? formatMinutes(entry.total_worked_minutes) : 'Sem registro'}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-mono font-medium',
                      entry.balance_minutes === null ? 'text-gray-400' :
                      entry.balance_minutes > 0 ? 'text-green-600' :
                      entry.balance_minutes < 0 ? 'text-red-600' : 'text-gray-400'
                    )}
                  >
                    {entry.balance_minutes !== null ? formatMinutes(entry.balance_minutes) : '-'}
                  </span>
                </Card>

                {isExpanded && calc && (
                  <div className="mt-2 ml-2 mr-2 mb-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Entrada" type="time" value={editValues.entry_1 || ''} onChange={(e) => setEditValues({ ...editValues, entry_1: e.target.value })} />
                      <Input label="Saída Almoço" type="time" value={editValues.exit_1 || ''} onChange={(e) => setEditValues({ ...editValues, exit_1: e.target.value })} />
                      <Input label="Retorno Almoço" type="time" value={editValues.entry_2 || ''} onChange={(e) => setEditValues({ ...editValues, entry_2: e.target.value })} />
                      <Input label="Saída Final" type="time" value={editValues.exit_2 || ''} onChange={(e) => setEditValues({ ...editValues, exit_2: e.target.value })} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Observações</label>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Notas sobre este dia..."
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total: <span className="font-mono font-medium">{formatMinutes(calc.totalWorkedMinutes)}</span></span>
                      <span className={cn('font-mono font-medium', calc.balanceMinutes > 0 ? 'text-green-600' : calc.balanceMinutes < 0 ? 'text-red-600' : 'text-gray-400')}>
                        Saldo: {formatMinutes(calc.balanceMinutes)}
                      </span>
                    </div>

                    <Button onClick={() => handleSave(entry)} fullWidth disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {(!entries || entries.length === 0) && (
            <p className="text-center text-gray-500 py-8">Nenhum registro neste mês</p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: implementar tela de histórico com edição de horários"
```

---

### Task 11: Settings Page

**Files:**
- Create: `src/hooks/useHolidays.ts`
- Modify: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Criar `src/hooks/useHolidays.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Holiday } from '@/types';

export function useHolidays() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['holidays', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .or(`user_id.eq.${user!.id},user_id.is.null`)
        .order('date');
      if (error) throw error;
      return data as Holiday[];
    },
    enabled: !!user,
  });
}

export function useAddHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (holiday: Pick<Holiday, 'date' | 'name'>) => {
      const { data, error } = await supabase
        .from('holidays')
        .insert({ ...holiday, is_national: false })
        .select()
        .single();
      if (error) throw error;
      return data as Holiday;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('holidays').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
}
```

- [ ] **Step 2: Substituir `src/pages/SettingsPage.tsx`**

```tsx
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useHolidays, useAddHoliday, useDeleteHoliday } from '@/hooks/useHolidays';
import { useAuth } from '@/hooks/useAuth';
import { useToast, Card, Button, Input, TimePicker } from '@/components/ui';

const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const { data: holidays } = useHolidays();
  const addHolidayMutation = useAddHoliday();
  const deleteHolidayMutation = useDeleteHoliday();
  const { signOut } = useAuth();
  const { showToast } = useToast();

  const [workHoursStart, setWorkHoursStart] = useState('08:00');
  const [workHoursEnd, setWorkHoursEnd] = useState('17:00');
  const [lunchBreakStart, setLunchBreakStart] = useState('12:00');
  const [lunchBreakEnd, setLunchBreakEnd] = useState('13:00');
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('07:30');
  const [dailyWorkload, setDailyWorkload] = useState(8);
  const [tolerance, setTolerance] = useState(5);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [showAddHoliday, setShowAddHoliday] = useState(false);

  useEffect(() => {
    if (settings) {
      setWorkHoursStart(settings.work_hours_start.slice(0, 5));
      setWorkHoursEnd(settings.work_hours_end.slice(0, 5));
      setLunchBreakStart(settings.lunch_break_start.slice(0, 5));
      setLunchBreakEnd(settings.lunch_break_end.slice(0, 5));
      setWorkDays(settings.work_days as number[]);
      setNotificationsEnabled(settings.notifications_enabled);
      setNotificationTime(settings.notification_time.slice(0, 5));
      setDailyWorkload(settings.daily_workload_minutes / 60);
      setTolerance(settings.tolerance_minutes);
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate(
      {
        work_hours_start: workHoursStart,
        work_hours_end: workHoursEnd,
        lunch_break_start: lunchBreakStart,
        lunch_break_end: lunchBreakEnd,
        work_days: workDays,
        notifications_enabled: notificationsEnabled,
        notification_time: notificationTime,
        daily_workload_minutes: dailyWorkload * 60,
        tolerance_minutes: tolerance,
      },
      {
        onSuccess: () => showToast('Configurações salvas', 'success'),
        onError: () => showToast('Erro ao salvar configurações', 'error'),
      }
    );
  };

  const toggleWorkDay = (day: number) => {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayName.trim()) return;
    addHolidayMutation.mutate(
      { date: newHolidayDate, name: newHolidayName },
      {
        onSuccess: () => {
          showToast('Feriado adicionado', 'success');
          setNewHolidayDate('');
          setNewHolidayName('');
          setShowAddHoliday(false);
        },
        onError: () => showToast('Erro ao adicionar feriado', 'error'),
      }
    );
  };

  const handleDeleteHoliday = (id: string) => {
    deleteHolidayMutation.mutate(id, {
      onSuccess: () => showToast('Feriado removido', 'success'),
      onError: () => showToast('Erro ao remover feriado', 'error'),
    });
  };

  const personalHolidays = (holidays || []).filter((h) => h.user_id !== null);
  const nationalHolidays = (holidays || []).filter((h) => h.user_id === null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-8">
      <Card className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-gray-900">Horários</h3>
        <div className="grid grid-cols-2 gap-3">
          <TimePicker label="Entrada" value={workHoursStart} onChange={setWorkHoursStart} />
          <TimePicker label="Saída" value={workHoursEnd} onChange={setWorkHoursEnd} />
          <TimePicker label="Início Almoço" value={lunchBreakStart} onChange={setLunchBreakStart} />
          <TimePicker label="Fim Almoço" value={lunchBreakEnd} onChange={setLunchBreakEnd} />
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-gray-900">Dias Trabalhados</h3>
        <div className="flex flex-wrap gap-2">
          {dayLabels.map((label, index) => (
            <button
              key={index}
              onClick={() => toggleWorkDay(index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] min-w-[44px] transition-colors ${
                workDays.includes(index)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-gray-900">Notificações</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Ativar notificações</span>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-12 h-7 rounded-full transition-colors ${
              notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {notificationsEnabled && (
          <TimePicker label="Horário do lembrete" value={notificationTime} onChange={setNotificationTime} />
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-gray-900">Jornada</h3>
        <Input
          label="Horas por dia"
          type="number"
          min={1}
          max={24}
          value={String(dailyWorkload)}
          onChange={(e) => setDailyWorkload(Number(e.target.value))}
        />
        <Input
          label="Tolerância (minutos)"
          type="number"
          min={0}
          max={60}
          value={String(tolerance)}
          onChange={(e) => setTolerance(Number(e.target.value))}
        />
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Feriados</h3>
          <button
            onClick={() => setShowAddHoliday(!showAddHoliday)}
            className="text-blue-500 text-sm font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            + Adicionar
          </button>
        </div>

        {showAddHoliday && (
          <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
            <Input label="Data" type="date" value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)} />
            <Input label="Nome" type="text" value={newHolidayName} onChange={(e) => setNewHolidayName(e.target.value)} placeholder="Ex: Aniversário da cidade" />
            <Button size="sm" onClick={handleAddHoliday} disabled={!newHolidayDate || !newHolidayName.trim()}>
              Adicionar
            </Button>
          </div>
        )}

        {nationalHolidays.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500 uppercase">Nacionais</p>
            {nationalHolidays.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">{dayjs(h.date).format('DD/MM')} - {h.name}</span>
              </div>
            ))}
          </div>
        )}

        {personalHolidays.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-gray-500 uppercase">Personalizados</p>
            {personalHolidays.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">{dayjs(h.date).format('DD/MM')} - {h.name}</span>
                <button
                  onClick={() => handleDeleteHoliday(h.id)}
                  className="text-red-500 text-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Button onClick={handleSave} fullWidth disabled={updateMutation.isPending}>
        {updateMutation.isPending ? 'Salvando...' : 'Salvar configurações'}
      </Button>

      <button
        onClick={signOut}
        className="text-center text-red-500 font-medium py-3 min-h-[44px]"
      >
        Sair
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: implementar tela de configurações com gerenciamento de feriados"
```

---

## FASE 3: Polish (paralelo após Fase 2)

> **2 agentes em paralelo**

---

### Task 12: PWA Setup

**Files:**
- Modify: `vite.config.ts`
- Modify: `index.html`
- Create: `public/icon-192.png` (placeholder)
- Create: `public/icon-512.png` (placeholder)

- [ ] **Step 1: Instalar vite-plugin-pwa**

```bash
npm install -D vite-plugin-pwa
```

- [ ] **Step 2: Atualizar `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Controle de Ponto',
        short_name: 'Ponto',
        description: 'Controle de ponto pessoal',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3b82f6',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

- [ ] **Step 3: Gerar ícones placeholder**

Criar ícones SVG simples como placeholder (ou usar um gerador de ícones PWA). Para o MVP, criar PNGs simples:

```bash
# Criar ícones placeholder (1x1 pixel blue PNGs - substituir por ícones reais depois)
node -e "const fs=require('fs');const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==','base64');fs.writeFileSync('public/icon-192.png',png);fs.writeFileSync('public/icon-512.png',png);"
```

- [ ] **Step 4: Verificar PWA**

```bash
npm run build
npm run preview
```

Verificar no DevTools > Application > Manifest que o manifest está correto.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: configurar PWA com service worker e manifest"
```

---

### Task 13: Notificações

**Files:**
- Create: `src/lib/notifications.ts`
- Create: `src/hooks/useNotifications.ts`
- Modify: `src/App.tsx` (adicionar hook de notificação)
- Modify: `src/pages/SettingsPage.tsx` (solicitar permissão)

- [ ] **Step 1: Criar `src/lib/notifications.ts`**

```ts
let notificationTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleNotification(notificationTime: string, enabled: boolean) {
  clearNotification();

  if (!enabled) return;

  if (!('Notification' in window)) return;

  const [hours, minutes] = notificationTime.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const delay = target.getTime() - now.getTime();

  notificationTimer = setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('Controle de Ponto', {
        body: 'Não esqueça de bater ponto!',
        icon: '/icon-192.png',
      });
    }
  }, delay);
}

export function clearNotification() {
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;

  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}
```

- [ ] **Step 2: Criar `src/hooks/useNotifications.ts`**

```ts
import { useEffect } from 'react';
import { useSettings } from './useSettings';
import { scheduleNotification, clearNotification } from '@/lib/notifications';

export function useNotifications() {
  const { data: settings } = useSettings();

  useEffect(() => {
    if (settings) {
      scheduleNotification(settings.notification_time, settings.notifications_enabled);
    }

    return () => {
      clearNotification();
    };
  }, [settings?.notification_time, settings?.notifications_enabled]);
}
```

- [ ] **Step 3: Adicionar hook de notificações no `src/App.tsx`**

Adicionar import e chamada do hook dentro do componente `App`:

```tsx
import { useNotifications } from '@/hooks/useNotifications';

export default function App() {
  useNotifications();

  return (
    // ... existing routes (não mudar)
  );
}
```

- [ ] **Step 4: Atualizar SettingsPage para solicitar permissão**

Adicionar import no topo do arquivo:

```tsx
import { requestNotificationPermission } from '@/lib/notifications';
```

Substituir o toggle de notificações inline por uma função:

```tsx
const handleToggleNotifications = async () => {
  if (!notificationsEnabled) {
    const granted = await requestNotificationPermission();
    if (!granted) {
      showToast('Permissão de notificação negada', 'error');
      return;
    }
  }
  setNotificationsEnabled(!notificationsEnabled);
};
```

E no JSX, trocar o `onClick` do toggle:

```tsx
onClick={handleToggleNotifications}
```

- [ ] **Step 5: Rodar testes**

```bash
npx vitest run
```

Expected: Todos os testes passam.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: adicionar sistema de notificações locais com agendamento"
```

---

## Resumo de Paralelização

```
FASE 0 (sequencial): Tasks 1 → 2 → 3 → 4
                          ↓
FASE 1 (paralelo):   Task 5 | Task 6 | Task 7
                          ↓
FASE 2 (paralelo):   Task 8 | Task 9 | Task 10 | Task 11
                          ↓
FASE 3 (paralelo):   Task 12 | Task 13
```

**Total: 13 tasks em 4 fases**
