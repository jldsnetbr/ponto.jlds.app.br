import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const abas = [
  { path: '/banco', label: 'Banco' },
  { path: '/ponto', label: 'Ponto' },
  { path: '/historico', label: 'Histórico' },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-around bg-white border-t border-gray-100 px-2 pb-safe">
      {abas.map((aba) => {
        const ativo = location.pathname === aba.path;
        return (
          <button
            key={aba.path}
            onClick={() => navigate(aba.path)}
            className={cn(
              'flex flex-col items-center py-2 px-4 min-h-[44px] min-w-[44px] transition-colors',
              ativo ? 'text-blue-500' : 'text-gray-400'
            )}
            aria-label={aba.label}
            aria-current={ativo ? 'page' : undefined}
          >
            <span className="text-xs font-medium">{aba.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
