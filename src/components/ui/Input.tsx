import { cn } from '@/lib/utilitarios';
import { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

export function Input({ label, id, className, containerClassName, ...props }: InputProps) {
  const inputId = useId();
  const finalId = id || inputId;

  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label htmlFor={finalId} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        id={finalId}
        className={cn(
          'rounded-lg border border-midnight-400/30 bg-midnight-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-midnight-400',
          className
        )}
        {...props}
      />
    </div>
  );
}
