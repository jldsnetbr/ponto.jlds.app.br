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
