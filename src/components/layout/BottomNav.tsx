import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/bank', label: 'Banco' },
  { path: '/punch', label: 'Ponto' },
  { path: '/history', label: 'Histórico' },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-around bg-white border-t border-gray-100 px-2 pb-safe">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex flex-col items-center py-2 px-4 min-h-[44px] min-w-[44px] transition-colors',
              isActive ? 'text-blue-500' : 'text-gray-400'
            )}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
