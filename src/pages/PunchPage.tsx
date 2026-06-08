import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useRegistroHoje } from '@/hooks/useRegistrosPonto';
import { useBaterPonto, useAlterarPonto } from '@/hooks/useMutacoesPonto';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { proximoTipoBatida, calcularTempoDecorrido } from '@/lib/calculos';
import { formatarMinutos } from '@/lib/utilitarios';
import { useToast, Card, Button, Spinner } from '@/components/ui';
import { PunchButton } from '@/components/punch/PunchButton';
import { StatusHoje } from '@/components/punch/StatusHoje';
import { BarraProgresso } from '@/components/punch/BarraProgresso';
import { ModalConfirmacaoBatida } from '@/components/punch/ModalConfirmacaoBatida';
import { Modal } from '@/components/ui/Modal';
import type { TipoBatida } from '@/types';

dayjs.locale('pt-br');

export function PunchPage() {
  const { data: entry, isLoading } = useRegistroHoje();
  const { data: config } = useConfiguracoes();
  const baterPonto = useBaterPonto();
  const alterarPonto = useAlterarPonto();
  const { showToast } = useToast();
  const [agora, setAgora] = useState(dayjs());

  const [showModal, setShowModal] = useState(false);
  const [tipoPendente, setTipoPendente] = useState<TipoBatida | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; tipo: TipoBatida } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setAgora(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const proximoTipo = proximoTipoBatida(
    entry || { entrada: null, saida_almoco: null, retorno_almoco: null, saida_final: null }
  );

  const totalMinutos = calcularTempoDecorrido(entry ?? null, agora);

  const progresso = config
    ? (totalMinutos / config.jornada_minutos) * 100
    : 0;

  const handlePunchClick = () => {
    if (!proximoTipo) return;
    setTipoPendente(proximoTipo);
    setShowModal(true);
  };

  const handleConfirmPunch = (horario: string) => {
    if (!tipoPendente || !proximoTipo) return;
    setShowModal(false);
    const hoje = dayjs().format('YYYY-MM-DD');
    const horarioISO = dayjs(`${hoje}T${horario}`).toISOString();
    baterPonto.mutate(
      { entry: entry || null, tipo: tipoPendente, horario: horarioISO },
      {
        onSuccess: () => {
          const labels: Record<string, string> = {
            entrada: 'Entrada',
            saida_almoco: 'Saída Almoço',
            retorno_almoco: 'Retorno Almoço',
            saida_final: 'Saída Final',
          };
          showToast(`${labels[tipoPendente]} registrada às ${horario}`, 'success');
        },
        onError: (err) => {
          console.error('[PONTO ERRO]', err);
          showToast((err as any)?.message || 'Erro ao registrar ponto', 'error');
        },
      }
    );
    setTipoPendente(null);
  };

  const handleEdit = (id: string, tipo: TipoBatida, horario: string) => {
    alterarPonto.mutate(
      { id, updates: { [tipo]: horario } },
      {
        onSuccess: () => showToast('Batida atualizada', 'success'),
        onError: (err) => {
          console.error('[EDICAO ERRO]', err);
          showToast((err as any)?.message || 'Erro ao atualizar batida', 'error');
        },
      }
    );
  };

  const handleDelete = (id: string, tipo: TipoBatida) => {
    setDeleteConfirm({ id, tipo });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    alterarPonto.mutate(
      { id: deleteConfirm.id, updates: { [deleteConfirm.tipo]: null } },
      {
        onSuccess: () => {
          const labels: Record<string, string> = {
            entrada: 'Entrada',
            saida_almoco: 'Saída Almoço',
            retorno_almoco: 'Retorno Almoço',
            saida_final: 'Saída Final',
          };
          showToast(`${labels[deleteConfirm.tipo]} removida`, 'success');
        },
        onError: (err) => {
          console.error('[EXCLUSAO ERRO]', err);
          showToast((err as any)?.message || 'Erro ao remover batida', 'error');
        },
      }
    );
    setDeleteConfirm(null);
  };

  const isPending = baterPonto.isPending || alterarPonto.isPending;

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="text-center">
        <p className="text-sm text-gray-500 capitalize">
          {agora.format('dddd, DD [de] MMMM [de] YYYY')}
        </p>
        <p className="text-4xl font-mono font-bold text-gray-900 mt-1">
          {agora.format('HH:mm:ss')}
        </p>
      </div>

      <PunchButton
        nextPunchType={proximoTipo}
        onPunch={handlePunchClick}
        disabled={isPending}
      />

      <div className="w-full max-w-sm">
        <p className="text-center text-lg font-medium text-gray-900">
          Trabalhado hoje: {formatarMinutos(totalMinutos)}
        </p>
      </div>

      <div className="w-full max-w-sm">
        <BarraProgresso progress={progresso} />
      </div>

      <Card className="w-full max-w-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Batidas de hoje</h3>
        <StatusHoje
          entry={entry || null}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isPending={isPending}
        />
      </Card>

      <ModalConfirmacaoBatida
        open={showModal}
        onClose={() => { setShowModal(false); setTipoPendente(null); }}
        onConfirm={handleConfirmPunch}
        tipo={tipoPendente}
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