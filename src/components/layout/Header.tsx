import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const initial = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <button
        onClick={() => navigate('/settings')}
        className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-lg"
        aria-label="Configurações"
      >
        {initial}
      </button>
      <h1 className="text-lg font-semibold text-gray-900">Controle de Ponto</h1>
      <button
        onClick={signOut}
        className="text-sm text-gray-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Sair"
      >
        Sair
      </button>
    </header>
  );
}
