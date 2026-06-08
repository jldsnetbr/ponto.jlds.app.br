import { cn } from '@/lib/utilitarios';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-midnight-400/20 bg-surface backdrop-blur-sm p-4 shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
