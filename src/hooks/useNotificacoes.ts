import { useEffect } from 'react';
import { useConfiguracoes } from './useConfiguracoes';
import { subscribeToPush, unsubscribeFromPush, getPushSubscription } from '@/lib/push';

export function useNotificacoes() {
  const { data: config } = useConfiguracoes();

  useEffect(() => {
    if (config?.notificacoes_ativas) {
      managePushSubscription(true);
    } else {
      managePushSubscription(false);
    }
  }, [config?.notificacoes_ativas]);
}

async function managePushSubscription(enable: boolean) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const existing = await getPushSubscription();

  if (enable && !existing) {
    await subscribeToPush();
  } else if (!enable && existing) {
    await unsubscribeFromPush();
  }
}
