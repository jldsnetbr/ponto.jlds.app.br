import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Modal, Button } from '@/components/ui';
import type { TipoBatida } from '@/types';

interface ModalConfirmacaoBatidaProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (horario: string) => void;
  tipo: TipoBatida | null;
}

const labels: Record<TipoBatida, string> = {
  entrada: 'Entrada',
  saida_almoco: 'Saída Almoço',
  retorno_almoco: 'Retorno Almoço',
  saida_final: 'Saída Final',
};

export function ModalConfirmacaoBatida({ open, onClose, onConfirm, tipo }: ModalConfirmacaoBatidaProps) {
  const [horario, setHorario] = useState('');

  useEffect(() => {
    if (open) setHorario(dayjs().format('HH:mm'));
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Confirmar Batida">
      <div className="flex flex-col items-center gap-4 py-2">
        <p className="text-xl font-bold text-blue-600">
          {tipo ? labels[tipo] : '---'}
        </p>

        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="horario-batida" className="sr-only">
            Horário da batida
          </label>
          <input
            id="horario-batida"
            type="time"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="text-5xl font-mono font-bold text-gray-900 text-center bg-transparent border-b-2 border-blue-500 focus:outline-none w-52 py-1 mx-auto"
            autoFocus
          />
        </div>

        <p className="text-sm text-gray-500 capitalize">
          {dayjs().format('dddd, DD [de] MMMM [de] YYYY')}
        </p>

        <div className="flex gap-3 w-full mt-2">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(horario)} fullWidth>
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}