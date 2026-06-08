import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useRegistrosPonto } from '@/hooks/useRegistrosPonto';
import { useAlterarPonto } from '@/hooks/useMutacoesPonto';
import { calcularDia } from '@/lib/calculos';
import { formatarMinutos, cn } from '@/lib/utilitarios';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { useToast, Card, Button, Input, Spinner } from '@/components/ui';
import type { RegistroPonto } from '@/types';

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function HistoryPage() {
  const [searchParams] = useSearchParams();
  const diaParam = searchParams.get('dia');
  const [anoMes, setAnoMes] = useState(() => diaParam ? dayjs(diaParam).format('YYYY-MM') : dayjs().format('YYYY-MM'));
  const { data: entries, isLoading } = useRegistrosPonto(anoMes);
  const { data: config } = useConfiguracoes();
  const mutation = useAlterarPonto();
  const { showToast } = useToast();
  const [expandido, setExpandido] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [editObs, setEditObs] = useState('');

  const mesAnterior = () => { setAnoMes(dayjs(anoMes, 'YYYY-MM').subtract(1, 'month').format('YYYY-MM')); setExpandido(null); };
  const mesSeguinte = () => { setAnoMes(dayjs(anoMes, 'YYYY-MM').add(1, 'month').format('YYYY-MM')); setExpandido(null); };
  const labelMes = dayjs(anoMes, 'YYYY-MM').format('MMMM [de] YYYY');

  const expandirEntry = (entry: RegistroPonto) => {
    setExpandido(entry.data);
    setEditValues({
      entrada: entry.entrada ? dayjs(entry.entrada).format('HH:mm') : '',
      saida_almoco: entry.saida_almoco ? dayjs(entry.saida_almoco).format('HH:mm') : '',
      retorno_almoco: entry.retorno_almoco ? dayjs(entry.retorno_almoco).format('HH:mm') : '',
      saida_final: entry.saida_final ? dayjs(entry.saida_final).format('HH:mm') : '',
    });
    setEditObs(entry.observacao || '');
  };

  const handleExpandir = (entry: RegistroPonto) => {
    if (expandido === entry.data) { setExpandido(null); return; }
    expandirEntry(entry);
  };

  useEffect(() => {
    if (diaParam && entries) {
      const match = entries.find(e => e.data === diaParam);
      if (match && expandido !== diaParam) expandirEntry(match);
    }
  }, [diaParam, entries]);

  const handleSalvar = (entry: RegistroPonto) => {
    const paraISO = (horario: string) => {
      if (!horario) return null;
      return dayjs(`${entry.data}T${horario}`).toISOString();
    };

    mutation.mutate(
      {
        id: entry.id,
        updates: {
          entrada: paraISO(editValues.entrada),
          saida_almoco: paraISO(editValues.saida_almoco),
          retorno_almoco: paraISO(editValues.retorno_almoco),
          saida_final: paraISO(editValues.saida_final),
          observacao: editObs || null,
        },
      },
      {
        onSuccess: () => showToast('Alterações salvas', 'success'),
        onError: (err) => {
          console.error('[HISTORICO ERRO]', err);
          showToast((err as any)?.message || 'Erro ao salvar alterações', 'error');
        },
      }
    );
  };

  const getCalculoEditado = (entry: RegistroPonto) => {
    const paraISO = (horario: string) => {
      if (!horario) return null;
      return dayjs(`${entry.data}T${horario}`).toISOString();
    };
    return calcularDia(
      paraISO(editValues.entrada),
      paraISO(editValues.saida_almoco),
      paraISO(editValues.retorno_almoco),
      paraISO(editValues.saida_final),
      config?.jornada_minutos ?? 480
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <button onClick={mesAnterior} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 text-lg hover:text-slate-200" aria-label="Mês anterior">←</button>
        <h2 className="text-lg font-semibold text-slate-100 capitalize">{labelMes}</h2>
        <button onClick={mesSeguinte} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 text-lg hover:text-slate-200" aria-label="Próximo mês">→</button>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="flex flex-col gap-2">
          {(entries || []).map((entry) => {
            const estaExpandido = expandido === entry.data;
            const data = dayjs(entry.data);
            const calc = estaExpandido ? getCalculoEditado(entry) : null;

            return (
              <div key={entry.id}>
                <Card onClick={() => handleExpandir(entry)} className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {diasSemana[data.day()]}, {data.format('DD/MM')}
                    </p>
                    <p className="text-xs text-slate-400">
                      {entry.total_minutos !== null ? formatarMinutos(entry.total_minutos) : 'Sem registro'}
                    </p>
                  </div>
                  <span className={cn('text-sm font-mono font-medium',
                    entry.saldo_minutos === null ? 'text-slate-500' :
                    entry.saldo_minutos > 0 ? 'text-emerald-400' :
                    entry.saldo_minutos < 0 ? 'text-red-400' : 'text-slate-500'
                  )}>
                    {entry.saldo_minutos !== null ? formatarMinutos(entry.saldo_minutos) : '-'}
                  </span>
                </Card>

                {estaExpandido && calc && (
                  <div className="mt-2 ml-2 mr-2 mb-2 p-4 bg-surface backdrop-blur-sm rounded-xl border border-midnight-400/20 shadow-lg flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Entrada" type="time" value={editValues.entrada || ''} onChange={(e) => setEditValues({ ...editValues, entrada: e.target.value })} />
                      <Input label="Saída Almoço" type="time" value={editValues.saida_almoco || ''} onChange={(e) => setEditValues({ ...editValues, saida_almoco: e.target.value })} />
                      <Input label="Retorno Almoço" type="time" value={editValues.retorno_almoco || ''} onChange={(e) => setEditValues({ ...editValues, retorno_almoco: e.target.value })} />
                      <Input label="Saída Final" type="time" value={editValues.saida_final || ''} onChange={(e) => setEditValues({ ...editValues, saida_final: e.target.value })} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-300">Observações</label>
                      <textarea
                        value={editObs}
                        onChange={(e) => setEditObs(e.target.value)}
                        className="rounded-lg border border-midnight-400/30 bg-midnight-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-midnight-400"
                        placeholder="Notas sobre este dia..."
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Total: <span className="font-mono font-medium text-slate-200">{formatarMinutos(calc.totalMinutos)}</span></span>
                      <span className={cn('font-mono font-medium', calc.saldoMinutos > 0 ? 'text-emerald-400' : calc.saldoMinutos < 0 ? 'text-red-400' : 'text-slate-400')}>
                        Saldo: {formatarMinutos(calc.saldoMinutos)}
                      </span>
                    </div>

                    <Button onClick={() => handleSalvar(entry)} fullWidth disabled={mutation.isPending}>
                      {mutation.isPending ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {(!entries || entries.length === 0) && (
            <p className="text-center text-slate-500 py-8">Nenhum registro neste mês</p>
          )}
        </div>
      )}
    </div>
  );
}
