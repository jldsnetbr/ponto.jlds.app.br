import dayjs from 'dayjs';
import { Modal, Button } from '@/components/ui';
import type { TipoBatida } from '@/types';

interface ConfirmPunchModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tipo: TipoBatida | null;
}

const labels: Record<TipoBatida, string> = {
  entrada: 'Entrada',
  saida_almoco: 'Saída Almoço',
  retorno_almoco: 'Retorno Almoço',
  saida_final: 'Saída Final',
};

export function ConfirmPunchModal({ open, onClose, onConfirm, tipo }: ConfirmPunchModalProps) {
  const agora = dayjs();

  return (
    <Modal open={open} onClose={onClose} title="Confirmar Batida">
      <div className="flex flex-col items-center gap-4 py-2">
        <p className="text-xl font-bold text-blue-600">
          {tipo ? labels[tipo] : '---'}
        </p>
        <p className="text-5xl font-mono font-bold text-gray-900">
          {agora.format('HH:mm:ss')}
        </p>
        <p className="text-sm text-gray-500 capitalize">
          {agora.format('dddd, DD [de] MMMM [de] YYYY')}
        </p>
        <div className="flex gap-3 w-full mt-2">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button onClick={onConfirm} fullWidth>
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
