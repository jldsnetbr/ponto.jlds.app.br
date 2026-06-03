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
