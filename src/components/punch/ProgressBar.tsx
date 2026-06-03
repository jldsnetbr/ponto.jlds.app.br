import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Progresso da jornada</span>
        <span>{Math.round(clampedProgress)}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            clampedProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
