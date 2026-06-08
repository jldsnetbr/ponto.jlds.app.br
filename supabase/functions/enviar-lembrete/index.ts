import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:contato@ponto.jlds.app.br';

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Buscar configurações de usuários com notificações ativas
    const { data: configs, error: configError } = await supabase
      .from('configuracoes')
      .select('usuario_id, notificacao_horario')
      .eq('notificacoes_ativas', true);

    if (configError) throw configError;
    if (!configs || configs.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhum usuário com notificações ativas' }));
    }

    const agora = new Date();
    const horarioAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    let enviados = 0;

    for (const config of configs) {
      // Verificar se o horário da notificação corresponde ao horário atual (com tolerância de 5 min)
      const [horas, minutos] = config.notificacao_horario.split(':').map(Number);
      const horarioConfig = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;

      // Tolerância: enviar se está dentro de 5 minutos do horário
      const diffMinutos = Math.abs(
        (horas * 60 + minutos) - (agora.getHours() * 60 + agora.getMinutes())
      );

      if (diffMinutos > 5) continue;

      // Buscar inscrições push do usuário
      const { data: subs, error: subError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('usuario_id', config.usuario_id);

      if (subError || !subs || subs.length === 0) continue;

      for (const sub of subs) {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          // Enviar push notification
          const response = await fetch(sub.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
              'TTL': '86400',
            },
            body: encodeVapidPayload(
              {
                title: 'Lembrete de Ponto',
                body: 'Não se esqueça de registrar seu ponto de hoje!',
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                data: { url: '/ponto' },
              },
              pushSubscription,
              VAPID_PRIVATE_KEY,
              VAPID_PUBLIC_KEY,
              VAPID_SUBJECT
            ),
          });

          if (response.ok) enviados++;
        } catch (err) {
          console.error(`[PUSH] Erro ao enviar para ${sub.endpoint}:`, err);
        }
      }
    }

    return new Response(JSON.stringify({ message: `${enviados} notificações enviadas` }));
  } catch (err) {
    console.error('[PUSH ERRO]', err);
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500 });
  }
});

function encodeVapidPayload(
  payload: Record<string, unknown>,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  privateKey: string,
  publicKey: string,
  subject: string
): Uint8Array {
  // Simplified VAPID encoding
  // In production, use a proper web-push library
  const encoder = new TextEncoder();
  return encoder.encode(JSON.stringify(payload));
}
