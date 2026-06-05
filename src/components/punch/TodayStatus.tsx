import { useState } from 'react';
import dayjs from 'dayjs';
import type { TimeEntry, PunchType } from '@/types';

interface TodayStatusProps {
  entry: TimeEntry | null;
  onEdit: (id: string, punchType: PunchType, time: string) => void;
  onDelete: (id: string, punchType: PunchType) => void;
  isPending: boolean;
}

const punchLabels: Record<string, string> = {
  entry_1: 'Entrada',
  exit_1: 'Saída Almoço',
  entry_2: 'Retorno Almoço',
  exit_2: 'Saída Final',
};

const punchOrder: PunchType[] = ['entry_1', 'exit_1', 'entry_2', 'exit_2'];

export function TodayStatus({ entry, onEdit, onDelete, isPending }: TodayStatusProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  if (!entry) {
    return <p className="text-sm text-gray-500 text-center">Nenhuma batida registrada hoje</p>;
  }

  const punches: { key: PunchType; time: string }[] = [];
  for (const key of punchOrder) {
    const time = entry[key];
    if (time) punches.push({ key, time });
  }

  const startEdit = (key: string, time: string) => {
    setEditingKey(key);
    setEditingValue(dayjs(time).format('HH:mm'));
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditingValue('');
  };

  const confirmEdit = () => {
    if (!editingKey || !editingValue) return;
    const date = dayjs(entry.date).format('YYYY-MM-DD');
    const fullTime = dayjs(`${date}T${editingValue}`).toISOString();
    onEdit(entry.id, editingKey as PunchType, fullTime);
    cancelEdit();
  };

  return (
    <div className="flex flex-col gap-1">
      {punches.map((punch) => (
        <div key={punch.key} className="flex items-center justify-between text-sm min-h-[44px]">
          {editingKey === punch.key ? (
            <div className="flex items-center gap-2 w-full">
              <input
                type="time"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[36px]"
                autoFocus
              />
              <button
                onClick={confirmEdit}
                disabled={isPending}
                className="text-green-600 font-medium min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-green-50 rounded-lg"
                aria-label="Salvar"
              >
                ✓
              </button>
              <button
                onClick={cancelEdit}
                className="text-gray-400 min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-gray-100 rounded-lg"
                aria-label="Cancelar"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <span className="text-gray-600">{punchLabels[punch.key]}</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-medium text-gray-900">
                  {dayjs(punch.time).format('HH:mm')}
                </span>
                <button
                  onClick={() => startEdit(punch.key, punch.time)}
                  className="text-gray-400 hover:text-blue-500 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-blue-50"
                  aria-label={`Editar ${punchLabels[punch.key]}`}
                >
                  ✎
                </button>
                <button
                  onClick={() => onDelete(entry.id, punch.key as PunchType)}
                  disabled={isPending}
                  className="text-gray-400 hover:text-red-500 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-red-50 disabled:opacity-30"
                  aria-label={`Remover ${punchLabels[punch.key]}`}
                >
                  🗑
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
