import { useRegistrosPonto } from '@/hooks/useRegistrosPonto';
import { calcularSaldoMensal } from '@/lib/calculos';
import { formatarMinutos, cn } from '@/lib/utilitarios';
import { Card, Spinner } from '@/components/ui';

export function BankPage() {
  const { data: allEntries, isLoading } = useRegistrosPonto();
  const saldoGeral = calcularSaldoMensal(allEntries || []);

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-4 min-h-[60vh]">
      <Card className={cn('w-full max-w-sm text-center py-10', saldoGeral > 0 && 'border-emerald-500/30', saldoGeral < 0 && 'border-red-500/30')}>
        <p className="text-sm text-slate-400 mb-2">Saldo Geral</p>
        <p className={cn('text-5xl font-bold font-mono', saldoGeral > 0 && 'text-emerald-400', saldoGeral < 0 && 'text-red-400', saldoGeral === 0 && 'text-slate-400')}>
          {formatarMinutos(saldoGeral)}
        </p>
      </Card>
    </div>
  );
}
