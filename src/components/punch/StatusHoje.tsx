import { useState } from 'react';
import dayjs from 'dayjs';
import { InlineTimeEditor } from '@/components/ui';
import type { RegistroPonto, TipoBatida } from '@/types';

interface StatusHojeProps {
  entry: RegistroPonto | null;
  onEdit: (id: string, tipo: TipoBatida, horario: string) => void;
  onDelete: (id: string, tipo: TipoBatida) => void;
  isPending: boolean;
}

const labels: Record<string, string> = {
  entrada: 'Entrada',
  saida_almoco: 'Saída Almoço',
  retorno_almoco: 'Retorno Almoço',
  saida_final: 'Saída Final',
};

const ordem: TipoBatida[] = ['entrada', 'saida_almoco', 'retorno_almoco', 'saida_final'];

export function StatusHoje({ entry, onEdit, onDelete, isPending }: StatusHojeProps) {
  const [editando, setEditando] = useState<string | null>(null);

  if (!entry) {
    return <p className="text-sm text-gray-500 text-center">Nenhuma batida registrada hoje</p>;
  }

  const batidas: { tipo: TipoBatida; horario: string }[] = [];
  for (const tipo of ordem) {
    const horario = entry[tipo];
    if (horario) batidas.push({ tipo, horario });
  }

  const iniciarEdicao = (tipo: string) => {
    setEditando(tipo);
  };

  const cancelarEdicao = () => {
    setEditando(null);
  };

  const confirmarEdicao = (tipo: string, editValor: string) => {
    if (!editValor) return;
    const data = dayjs(entry.data).format('YYYY-MM-DD');
    const completo = dayjs(`${data}T${editValor}`).toISOString();
    onEdit(entry.id, tipo as TipoBatida, completo);
    cancelarEdicao();
  };

  return (
    <div className="flex flex-col gap-1">
      {batidas.map((batida) => (
        <div key={batida.tipo} className="flex items-center justify-between text-sm min-h-[44px]">
          {editando === batida.tipo ? (
            <InlineTimeEditor
              value={dayjs(batida.horario).format('HH:mm')}
              onSave={(valor: string) => confirmarEdicao(batida.tipo, valor)}
              onCancel={cancelarEdicao}
              isPending={isPending}
            />
          ) : (
            <>
              <span className="text-gray-600">{labels[batida.tipo]}</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-medium text-gray-900">
                  {dayjs(batida.horario).format('HH:mm')}
                </span>
                <button
                  onClick={() => iniciarEdicao(batida.tipo)}
                  className="text-gray-400 hover:text-blue-500 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-blue-50"
                  aria-label={`Editar ${labels[batida.tipo]}`}
                >✎</button>
                <button
                  onClick={() => onDelete(entry.id, batida.tipo)}
                  disabled={isPending}
                  className="text-gray-400 hover:text-red-500 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-red-50 disabled:opacity-30"
                  aria-label={`Remover ${labels[batida.tipo]}`}
                >🗑</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}