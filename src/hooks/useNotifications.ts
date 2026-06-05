import { useEffect } from 'react';
import { useConfiguracoes } from './useSettings';
import { scheduleNotification, clearNotification } from '@/lib/notifications';

export function useNotificacoes() {
  const { data: config } = useConfiguracoes();

  useEffect(() => {
    if (config) {
      scheduleNotification(config.notificacao_horario, config.notificacoes_ativas);
    }

    return () => {
      clearNotification();
    };
  }, [config?.notificacao_horario, config?.notificacoes_ativas]);
}
