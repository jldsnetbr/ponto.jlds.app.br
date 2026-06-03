import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useTodayEntry, usePunch } from '@/hooks/useTimeEntries';
import { useSettings } from '@/hooks/useSettings';
import { getNextPunchType, calculateDay } from '@/lib/calculations';
import { formatMinutes } from '@/lib/utils';
import { useToast } from '@/components/ui';
import { PunchButton } from '@/components/punch/PunchButton';
import { TodayStatus } from '@/components/punch/TodayStatus';
import { ProgressBar } from '@/components/punch/ProgressBar';
import { Card } from '@/components/ui';

dayjs.locale('pt-br');

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
        <p className="text-sm text-gray-500 capitalize">
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
