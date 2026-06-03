import { cn } from '@/lib/utils';
import type { PunchType } from '@/types';

interface PunchButtonProps {
  nextPunchType: PunchType | null;
  onPunch: () => void;
  disabled?: boolean;
}

const punchLabels: Record<PunchType, string> = {
  entry_1: 'Entrada',
  exit_1: 'Saída Almoço',
  entry_2: 'Retorno Almoço',
  exit_2: 'Saída Final',
};

export function PunchButton({ nextPunchType, onPunch, disabled }: PunchButtonProps) {
  const isComplete = !nextPunchType;

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onPunch}
        disabled={isComplete || disabled}
        className={cn(
          'w-48 h-48 rounded-full font-bold text-xl text-white shadow-lg transition-all active:scale-95',
          'flex flex-col items-center justify-center gap-2',
          isComplete
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 active:bg-blue-600',
          disabled && 'opacity-50'
        )}
        aria-label={isComplete ? 'Jornada completa' : `Bater ponto: ${nextPunchType ? punchLabels[nextPunchType] : ''}`}
      >
        {isComplete ? (
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
      {!isComplete && nextPunchType && (
        <p className="text-sm text-gray-600">
          Próxima batida: <span className="font-semibold">{punchLabels[nextPunchType]}</span>
        </p>
      )}
    </div>
  );
}
