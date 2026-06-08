import { useStatusOnline } from '@/hooks/useStatusOnline';

import { useId } from 'react';

export function OfflineBanner() {
  const { isOnline, syncing } = useStatusOnline();
  const id = useId();

  if (isOnline && !syncing) return null;

  return (
    <div
      role="alert"
      id={id}
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center p-4 text-sm font-medium text-white bg-gray-800"
    >
      {syncing ? (
        <p>Sincronizando batidas pendentes...</p>
      ) : (
        <p>Você está offline. Batidas serão sincronizadas ao reconectar.</p>
      )}
    </div>
  );
}
