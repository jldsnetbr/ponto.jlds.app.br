import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '@/hooks/useAutenticacao';
import { ROTAS } from '@/lib/rotas';

export function Header() {
  const { usuario, sair } = useAutenticacao();
  const navigate = useNavigate();

  const inicial = usuario?.email?.charAt(0).toUpperCase() || '?';

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <button
        onClick={() => navigate(ROTAS.CONFIGURACOES)}
        className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-lg"
        aria-label="Configurações"
        aria-expanded="false"
        aria-haspopup="menu"
      >
        {inicial}
      </button>
      <h1 className="text-lg font-semibold text-gray-900">Controle de Ponto</h1>
      <button
        onClick={() => { if (window.confirm('Tem certeza que deseja sair?')) sair(); }}
        className="text-sm text-gray-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Sair"
      >
        Sair
      </button>
    </header>
  );
}