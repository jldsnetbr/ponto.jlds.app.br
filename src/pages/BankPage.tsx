import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useRegistrosPonto } from '@/hooks/useTimeEntries';
import { calcularSaldoMensal } from '@/lib/calculations';
import { formatarMinutos, cn } from '@/lib/utils';
import { Card } from '@/components/ui';

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function BankPage() {
  const [anoMes, setAnoMes] = useState(dayjs().format('YYYY-MM'));
  const { data: entries, isLoading } = useRegistrosPonto(anoMes);
  const navigate = useNavigate();

  const saldoMensal = calcularSaldoMensal(entries || []);

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
      <div className="flex items-center justify-between">
        <button onClick={mesAnterior} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 text-lg" aria-label="Mês anterior">←</button>
        <h2 className="text-lg font-semibold text-gray-900 capitalize">{labelMes}</h2>
        <button onClick={mesSeguinte} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 text-lg" aria-label="Próximo mês">→</button>
      </div>

      <Card className={cn('text-center py-6', saldoMensal > 0 && 'bg-green-50 border-green-200', saldoMensal < 0 && 'bg-red-50 border-red-200')}>
        <p className="text-sm text-gray-600 mb-1">Saldo do mês</p>
        <p className={cn('text-3xl font-bold font-mono', saldoMensal > 0 && 'text-green-600', saldoMensal < 0 && 'text-red-600', saldoMensal === 0 && 'text-gray-600')}>
          {formatarMinutos(saldoMensal)}
        </p>
      </Card>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {dias.map((dia) => {
            const saldo = dia.entry?.saldo_minutos;
            const total = dia.entry?.total_minutos;
            const saldoZero = saldo !== null && saldo !== undefined && Math.abs(saldo) <= 5;

            return (
              <Card
                key={dia.data}
                onClick={() => { if (dia.entry) navigate('/history'); }}
                className={cn('flex items-center justify-between py-3', !dia.entry && 'opacity-50')}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-8">{dia.diaSemana}</span>
                  <span className="text-sm font-medium text-gray-900 w-6">{dia.diaNum}</span>
                </div>
                <div className="flex items-center gap-4">
                  {total !== null && total !== undefined ? (
                    <span className="text-sm text-gray-600 font-mono">{formatarMinutos(total)}</span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                  {saldo !== null && saldo !== undefined ? (
                    <span className={cn('text-sm font-mono font-medium w-20 text-right', saldoZero ? 'text-gray-400' : saldo > 0 ? 'text-green-600' : 'text-red-600')}>
                      {saldoZero ? formatarMinutos(0) : formatarMinutos(saldo)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 w-20 text-right">-</span>
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
