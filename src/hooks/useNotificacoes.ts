import { useEffect } from 'react';
import { useConfiguracoes } from './useConfiguracoes';
import { scheduleNotification, clearNotification } from '@/lib/notificacoes';
import dayjs from 'dayjs';

export function useNotificacoes() {
  const { data: config } = useConfiguracoes();

  useEffect(() => {
    if (config?.notificacoes_ativas && config.notificacao_horario) {
      const [horas, minutos] = config.notificacao_horario.split(':').map(Number);
      let targetTime = dayjs().hour(horas).minute(minutos).second(0);

      if (targetTime.isBefore(dayjs())) {
        targetTime = targetTime.add(1, 'day');
      }

      scheduleNotification(targetTime.toDate(), 'Lembrete de Ponto', 'Não se esqueça de registrar seu ponto de hoje!');
    } else {
      clearNotification();
    }

    return () => clearNotification();
  }, [config]);
}