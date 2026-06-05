import dayjs from 'dayjs';
import { Modal, Button } from '@/components/ui';
import type { PunchType } from '@/types';

interface ConfirmPunchModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  punchType: PunchType | null;
}

const punchLabels: Record<PunchType, string> = {
  entry_1: 'Entrada',
  exit_1: 'Saída Almoço',
  entry_2: 'Retorno Almoço',
  exit_2: 'Saída Final',
};

export function ConfirmPunchModal({ open, onClose, onConfirm, punchType }: ConfirmPunchModalProps) {
  const now = dayjs();

  return (
    <Modal open={open} onClose={onClose} title="Confirmar Batida">
      <div className="flex flex-col items-center gap-4 py-2">
        <p className="text-xl font-bold text-blue-600">
          {punchType ? punchLabels[punchType] : '---'}
        </p>
        <p className="text-5xl font-mono font-bold text-gray-900">
          {now.format('HH:mm:ss')}
        </p>
        <p className="text-sm text-gray-500 capitalize">
          {now.format('dddd, DD [de] MMMM [de] YYYY')}
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
