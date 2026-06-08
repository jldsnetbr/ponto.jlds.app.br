import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utilitarios';
import { ROTAS } from '@/lib/rotas';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = pathname === to || (to === ROTAS.PONTO && pathname === '/');

  return (
    <button
      onClick={() => navigate(to)}
      className={cn(
        'flex flex-col items-center justify-center p-2 rounded-lg transition-colors',
        isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      )}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-md p-2 flex justify-around">
      <NavItem to={ROTAS.PONTO} icon="⏱️" label="Ponto" />
      <NavItem to={ROTAS.BANCO} icon="🏦" label="Banco" />
      <NavItem to={ROTAS.HISTORICO} icon="🗓️" label="Histórico" />
    </nav>
  );
}