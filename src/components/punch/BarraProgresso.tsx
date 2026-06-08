import { cn } from '@/lib/utilitarios';

interface BarraProgressoProps {
  progress: number;
}

export function BarraProgresso({ progress }: BarraProgressoProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full" role="progressbar" aria-valuenow={Math.round(clampedProgress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da jornada">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>Progresso da jornada</span>
        <span>{Math.round(clampedProgress)}%</span>
      </div>
      <div className="w-full h-3 bg-midnight-800/60 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            clampedProgress >= 100 ? 'bg-emerald-500' : 'bg-midnight-400'
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
