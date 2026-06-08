import { supabase } from '@/lib/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications não suportadas neste navegador');
    return null;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('VAPID_PUBLIC_KEY não configurada');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });

    await saveSubscription(subscription);
    return subscription;
  } catch (err) {
    console.error('[PUSH] Erro ao inscrever:', err);
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await removeSubscription(subscription.endpoint);
      await subscription.unsubscribe();
    }

    return true;
  } catch (err) {
    console.error('[PUSH] Erro ao cancelar inscrição:', err);
    return false;
  }
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

async function saveSubscription(subscription: PushSubscription): Promise<void> {
  const { endpoint } = subscription;
  const keys = subscription.getKey('p256dh');
  const auth = subscription.getKey('auth');

  if (!keys || !auth) return;

  const p256dh = bufferToBase64(keys);
  const authKey = bufferToBase64(auth);

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { endpoint, p256dh, auth: authKey },
      { onConflict: 'usuario_id,endpoint' }
    );

  if (error) console.error('[PUSH] Erro ao salvar inscrição:', error);
}

async function removeSubscription(endpoint: string): Promise<void> {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);

  if (error) console.error('[PUSH] Erro ao remover inscrição:', error);
}
