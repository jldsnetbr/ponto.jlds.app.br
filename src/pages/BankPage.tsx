import { useState } from 'react';
import dayjs from 'dayjs';
import { useRegistrosPonto } from '@/hooks/useRegistrosPonto';
import { calcularSaldoMensal, gerarCSV, downloadCSV } from '@/lib/calculos';
import { formatarMinutos, cn } from '@/lib/utilitarios';
import { useToast, Card, Spinner } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';

const mesesDisponiveis = () => {
  const meses: string[] = [];
  const atual = dayjs();
  for (let i = 0; i < 12; i++) {
    meses.push(atual.subtract(i, 'month').format('YYYY-MM'));
  }
  return meses;
};

export function BankPage() {
  const { showToast } = useToast();
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);
  const [showModalMes, setShowModalMes] = useState(false);

  const { data: allEntries, isLoading: isLoadingAll } = useRegistrosPonto();
  const { data: mesEntries } = useRegistrosPonto(
    mesSelecionado || undefined
  );

  const saldoGeral = calcularSaldoMensal(allEntries || []);
  const saldoMes = mesSelecionado ? calcularSaldoMensal(mesEntries || []) : null;

  const entriesParaExibir = mesSelecionado ? (mesEntries || []) : (allEntries || []);

  const labelMes = mesSelecionado
    ? dayjs(mesSelecionado, 'YYYY-MM').format('MMMM [de] YYYY')
    : 'Todos os meses';

  const handleExportarCSV = () => {
    if (entriesParaExibir.length === 0) {
      showToast('Nenhum registro para exportar', 'info');
      return;
    }
    const csv = gerarCSV(entriesParaExibir);
    const nome = mesSelecionado ? `pontos-${mesSelecionado}.csv` : 'pontos-geral.csv';
    downloadCSV(csv, nome);
    showToast('CSV exportado com sucesso', 'success');
  };

  if (isLoadingAll) return <Spinner />;

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-4 min-h-[60vh]">
      <Card className={cn('w-full max-w-sm text-center py-10', saldoGeral > 0 && 'border-emerald-500/30', saldoGeral < 0 && 'border-red-500/30')}>
        <p className="text-sm text-slate-400 mb-2">Saldo Geral</p>
        <p className={cn('text-5xl font-bold font-mono', saldoGeral > 0 && 'text-emerald-400', saldoGeral < 0 && 'text-red-400', saldoGeral === 0 && 'text-slate-400')}>
          {formatarMinutos(saldoGeral)}
        </p>
      </Card>

      {mesSelecionado && (
        <Card className="w-full max-w-sm text-center py-6">
          <p className="text-sm text-slate-400 mb-1">Saldo de {labelMes}</p>
          <p className={cn('text-2xl font-bold font-mono', (saldoMes ?? 0) > 0 && 'text-emerald-400', (saldoMes ?? 0) < 0 && 'text-red-400', saldoMes === 0 && 'text-slate-400')}>
            {formatarMinutos(saldoMes ?? 0)}
          </p>
        </Card>
      )}

      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={() => setShowModalMes(true)}
          className="flex-1 min-h-[44px] rounded-xl border border-midnight-400/30 bg-midnight-900/60 text-sm text-slate-300 hover:bg-midnight-800/60 transition-colors"
        >
          {mesSelecionado ? dayjs(mesSelecionado, 'YYYY-MM').format('MMM YYYY') : 'Selecionar mês'}
        </button>
        {mesSelecionado && (
          <button
            onClick={() => setMesSelecionado(null)}
            className="min-h-[44px] px-4 rounded-xl border border-midnight-400/30 bg-midnight-900/60 text-sm text-slate-400 hover:bg-midnight-800/60 transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      <button
        onClick={handleExportarCSV}
        className="text-sm text-slate-400 hover:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        Exportar CSV
      </button>

      <Modal open={showModalMes} onClose={() => setShowModalMes(false)} title="Selecionar mês">
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {mesesDisponiveis().map((mes) => (
            <button
              key={mes}
              onClick={() => { setMesSelecionado(mes); setShowModalMes(false); }}
              className={cn(
                'min-h-[44px] rounded-lg px-4 py-2 text-sm text-left transition-colors',
                mesSelecionado === mes
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:bg-midnight-800/60'
              )}
            >
              {dayjs(mes, 'YYYY-MM').format('MMMM [de] YYYY')}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
