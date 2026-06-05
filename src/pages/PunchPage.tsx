import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useTodayEntry, usePunch, useDeletePunch, useUpdateSinglePunch } from '@/hooks/useTimeEntries';
import { useSettings } from '@/hooks/useSettings';
import { getNextPunchType, calculateDay } from '@/lib/calculations';
import { formatMinutes } from '@/lib/utils';
import { useToast, Card, Button } from '@/components/ui';
import { PunchButton } from '@/components/punch/PunchButton';
import { TodayStatus } from '@/components/punch/TodayStatus';
import { ProgressBar } from '@/components/punch/ProgressBar';
import { ConfirmPunchModal } from '@/components/punch/ConfirmPunchModal';
import { Modal } from '@/components/ui/Modal';
import type { PunchType } from '@/types';

dayjs.locale('pt-br');

export function PunchPage() {
  const { data: entry, isLoading } = useTodayEntry();
  const { data: settings } = useSettings();
  const punchMutation = usePunch();
  const deletePunchMutation = useDeletePunch();
  const updateSinglePunchMutation = useUpdateSinglePunch();
  const { showToast } = useToast();
  const [now, setNow] = useState(dayjs());

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPunchType, setPendingPunchType] = useState<PunchType | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; punchType: PunchType } | null>(null);

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

  const handlePunchClick = () => {
    if (!nextPunchType) return;
    setPendingPunchType(nextPunchType);
    setShowConfirmModal(true);
  };

  const handleConfirmPunch = () => {
    if (!pendingPunchType || !nextPunchType) return;
    setShowConfirmModal(false);
    punchMutation.mutate(
      { entry: entry || null, punchType: pendingPunchType },
      {
        onSuccess: () => {
          const labels: Record<string, string> = {
            entry_1: 'Entrada',
            exit_1: 'Saída Almoço',
            entry_2: 'Retorno Almoço',
            exit_2: 'Saída Final',
          };
          showToast(`${labels[pendingPunchType]} registrada às ${dayjs().format('HH:mm')}`, 'success');
        },
        onError: () => {
          showToast('Erro ao registrar ponto', 'error');
        },
      }
    );
    setPendingPunchType(null);
  };

  const handleEdit = (id: string, punchType: PunchType, time: string) => {
    updateSinglePunchMutation.mutate(
      { id, punchType, time },
      {
        onSuccess: () => {
          showToast('Batida atualizada', 'success');
        },
        onError: () => {
          showToast('Erro ao atualizar batida', 'error');
        },
      }
    );
  };

  const handleDelete = (id: string, punchType: PunchType) => {
    setDeleteConfirm({ id, punchType });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    deletePunchMutation.mutate(
      { id: deleteConfirm.id, punchType: deleteConfirm.punchType },
      {
        onSuccess: () => {
          const labels: Record<string, string> = {
            entry_1: 'Entrada',
            exit_1: 'Saída Almoço',
            entry_2: 'Retorno Almoço',
            exit_2: 'Saída Final',
          };
          showToast(`${labels[deleteConfirm.punchType]} removida`, 'success');
        },
        onError: () => {
          showToast('Erro ao remover batida', 'error');
        },
      }
    );
    setDeleteConfirm(null);
  };

  const isPending = punchMutation.isPending || deletePunchMutation.isPending || updateSinglePunchMutation.isPending;

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
        onPunch={handlePunchClick}
        disabled={isPending}
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
        <TodayStatus
          entry={entry || null}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isPending={isPending}
        />
      </Card>

      <ConfirmPunchModal
        open={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setPendingPunchType(null); }}
        onConfirm={handleConfirmPunch}
        punchType={pendingPunchType}
      />

      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Remover batida"
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <p className="text-gray-600 text-center">
            Tem certeza que deseja remover esta batida?
          </p>
          <div className="flex gap-3 w-full mt-2">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)} fullWidth>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} fullWidth>
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
