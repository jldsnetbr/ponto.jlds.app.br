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
