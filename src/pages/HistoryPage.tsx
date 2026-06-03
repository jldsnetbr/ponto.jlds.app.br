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
