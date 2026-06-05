import { supabase } from './supabase';
import { calculateDay } from './calculations';
import type { TimeEntry, UserSettings } from '@/types';

export async function recalculateAndSave(entry: TimeEntry, settings: UserSettings | undefined): Promise<void> {
  if (!settings) return;

  const { totalWorkedMinutes, balanceMinutes } = calculateDay(
    entry.entry_1 ? new Date(entry.entry_1) : null,
    entry.exit_1 ? new Date(entry.exit_1) : null,
    entry.entry_2 ? new Date(entry.entry_2) : null,
    entry.exit_2 ? new Date(entry.exit_2) : null,
    settings.daily_workload_minutes,
    settings.tolerance_minutes
  );

  const { error } = await supabase
    .from('time_entries')
    .update({ total_worked_minutes: totalWorkedMinutes, balance_minutes: balanceMinutes })
    .eq('id', entry.id);

  if (error) {
    console.error('Erro ao recalcular saldo:', error.message);
    throw new Error('Erro ao recalcular saldo do dia');
  }
}
