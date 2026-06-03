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
