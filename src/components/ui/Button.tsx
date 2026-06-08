import { cn } from '@/lib/utilitarios';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  className,
  asChild = false,
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  const baseStyles = 
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-900 disabled:opacity-50 disabled:pointer-events-none';

  const variantStyles = {
    primary: 'bg-midnight-500 text-white hover:bg-midnight-600 focus-visible:ring-midnight-400',
    secondary: 'bg-midnight-800/50 text-slate-200 hover:bg-midnight-700/50 border border-midnight-400/20 focus-visible:ring-midnight-400',
    danger: 'bg-red-700 text-white hover:bg-red-600 focus-visible:ring-red-500',
    ghost: 'hover:bg-midnight-800/30 text-slate-300 focus-visible:ring-midnight-400',
  };

  const sizeStyles = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8 text-lg',
  };

  return (
    <Comp
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    />
  );
}
