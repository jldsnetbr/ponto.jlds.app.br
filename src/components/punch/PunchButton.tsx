import { cn } from '@/lib/utilitarios';
import type { TipoBatida } from '@/types';

interface PunchButtonProps {
  nextPunchType: TipoBatida | null;
  onPunch: () => void;
  disabled?: boolean;
}

const labels: Record<TipoBatida, string> = {
  entrada: 'Entrada',
  saida_almoco: 'Saída Almoço',
  retorno_almoco: 'Retorno Almoço',
  saida_final: 'Saída Final',
};

export function PunchButton({ nextPunchType, onPunch, disabled }: PunchButtonProps) {
  const completo = !nextPunchType;
  const isDisabled = completo || disabled;

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onPunch}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-pressed={false}
        className={cn(
          'w-48 h-48 rounded-full font-bold text-xl text-white shadow-lg transition-all active:scale-95',
          'flex flex-col items-center justify-center gap-2',
          completo ? 'bg-slate-700 cursor-not-allowed' : 'bg-midnight-500 active:bg-midnight-600 shadow-midnight-500/30',
          disabled && 'opacity-50'
        )}
        aria-label={completo ? 'Jornada completa' : `Bater ponto: ${nextPunchType ? labels[nextPunchType] : ''}`}
      >
        {completo ? (
          <>
            <span className="text-3xl">✓</span>
            <span>Jornada Completa</span>
          </>
        ) : (
          <>
            <span className="text-3xl">👆</span>
            <span>Bater Ponto</span>
          </>
        )}
      </button>
      {!completo && nextPunchType && (
        <p className="text-sm text-slate-400">
          Próxima batida: <span className="font-semibold text-slate-200">{labels[nextPunchType]}</span>
        </p>
      )}
    </div>
  );
}
