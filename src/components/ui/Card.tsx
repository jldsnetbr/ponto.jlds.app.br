import { cn } from '@/lib/utilitarios';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-4 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}