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
