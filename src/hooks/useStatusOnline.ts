import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAutenticacao } from './useAutenticacao';
import { useConfiguracoes } from './useConfiguracoes';
import { recalcularESalvar } from '@/lib/calculos';
import { listarPendentes, removerPendente } from '@/lib/offlineQueue';
import type { RegistroPonto } from '@/types';

export function useStatusOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const { usuario } = useAutenticacao();
  const { data: config } = useConfiguracoes();

  const syncPendingPunches = useCallback(async () => {
    if (!usuario || syncing) return;

    const pending = await listarPendentes();
    if (pending.length === 0) return;

    setSyncing(true);

    for (const punch of pending) {
      try {
        let entry: RegistroPonto | null = null;

        if (punch.entry_id) {
          const { data } = await supabase
            .from('pontos')
            .select('*')
            .eq('id', punch.entry_id)
            .single();
          entry = data as RegistroPonto | null;
        }

        if (!entry) {
          const { data, error } = await supabase
            .from('pontos')
            .insert({ usuario_id: punch.usuario_id, data: punch.data, [punch.tipo]: punch.horario })
            .select()
            .single();
          if (error) throw error;
          entry = data as RegistroPonto;
        } else {
          const { data, error } = await supabase
            .from('pontos')
            .update({ [punch.tipo]: punch.horario })
            .eq('id', entry.id)
            .select()
            .single();
          if (error) throw error;
          entry = data as RegistroPonto;
        }

        if (entry && config) {
          await recalcularESalvar(entry, config);
        }

        if (punch.id) {
          await removerPendente(punch.id);
        }
      } catch (err) {
        console.error('[SYNC ERRO]', err);
      }
    }

    setSyncing(false);
  }, [usuario, config, syncing]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingPunches();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar pendentes ao montar
    if (navigator.onLine) {
      syncPendingPunches();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingPunches]);

  return { isOnline, syncing };
}
