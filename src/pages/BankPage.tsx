import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useRegistrosPonto } from '@/hooks/useRegistrosPonto';
import { calcularSaldoMensal } from '@/lib/calculos';
import { formatarMinutos, cn } from '@/lib/utilitarios';
import { Card, Spinner } from '@/components/ui';

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function BankPage() {
  const [anoMes, setAnoMes] = useState(dayjs().format('YYYY-MM'));
  const { data: allEntries, isLoading } = useRegistrosPonto();

  const saldoGeral = calcularSaldoMensal(allEntries || []);

  const entries = useMemo(
    () => (allEntries || []).filter((e) => e.data.startsWith(anoMes)),
    [allEntries, anoMes]
  );

  const mesAnterior = () => setAnoMes(dayjs(anoMes, 'YYYY-MM').subtract(1, 'month').format('YYYY-MM'));
  const mesSeguinte = () => setAnoMes(dayjs(anoMes, 'YYYY-MM').add(1, 'month').format('YYYY-MM'));

  const labelMes = dayjs(anoMes, 'YYYY-MM').format('MMMM [de] YYYY');

  const diasNoMes = dayjs(anoMes, 'YYYY-MM').daysInMonth();
  const dias = Array.from({ length: diasNoMes }, (_, i) => {
    const data = dayjs(anoMes, 'YYYY-MM').date(i + 1);
    const dataStr = data.format('YYYY-MM-DD');
    const entry = entries?.find((e) => e.data === dataStr);
    return {
      data: dataStr,
      diaSemana: diasSemana[data.day()],
      diaNum: i + 1,
      entry,
    };
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card className={cn('text-center py-6', saldoGeral > 0 && 'border-emerald-500/30', saldoGeral < 0 && 'border-red-500/30')}>
        <p className="text-sm text-slate-400 mb-1">Saldo Geral</p>
        <p className={cn('text-3xl font-bold font-mono', saldoGeral > 0 && 'text-emerald-400', saldoGeral < 0 && 'text-red-400', saldoGeral === 0 && 'text-slate-400')}>
          {formatarMinutos(saldoGeral)}
        </p>
      </Card>

      <div className="flex items-center justify-between">
        <button onClick={mesAnterior} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 text-lg hover:text-slate-200" aria-label="Mês anterior">←</button>
        <h2 className="text-lg font-semibold text-slate-100 capitalize">{labelMes}</h2>
        <button onClick={mesSeguinte} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 text-lg hover:text-slate-200" aria-label="Próximo mês">→</button>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="flex flex-col gap-2">
          {dias.map((dia) => {
            const saldo = dia.entry?.saldo_minutos;
            const total = dia.entry?.total_minutos;
            const saldoZero = saldo !== null && saldo !== undefined && Math.abs(saldo) <= 5;

            return (
              <Card
                key={dia.data}
                className={cn('flex items-center justify-between py-3', !dia.entry && 'opacity-50')}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-8">{dia.diaSemana}</span>
                  <span className="text-sm font-medium text-slate-200 w-6">{dia.diaNum}</span>
                </div>
                <div className="flex items-center gap-4">
                  {total !== null && total !== undefined ? (
                    <span className="text-sm text-slate-300 font-mono">{formatarMinutos(total)}</span>
                  ) : (
                    <span className="text-sm text-slate-500">-</span>
                  )}
                  {saldo !== null && saldo !== undefined ? (
                    <span className={cn('text-sm font-mono font-medium w-20 text-right', saldoZero ? 'text-slate-500' : saldo > 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {saldoZero ? formatarMinutos(0) : formatarMinutos(saldo)}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500 w-20 text-right">-</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
