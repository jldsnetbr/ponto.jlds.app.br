const SUPABASE = 'https://sfpilqfqkuzqyswgyolx.supabase.co';
const TIMEOUT_MS = 10000;

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  const isApi =
    url.pathname.startsWith('/auth/v1/') ||
    url.pathname.startsWith('/rest/v1/') ||
    url.pathname.startsWith('/storage/v1/');

  if (!isApi) return next();

  const upstream = SUPABASE + url.pathname + url.search;
  const headers = new Headers(request.headers);
  headers.delete('host');

  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.text();
    } catch {
      body = null;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const start = Date.now();

  try {
    const response = await fetch(upstream, {
      method: request.method,
      headers,
      body,
      signal: controller.signal,
    });
    const elapsed = Date.now() - start;

    if (!response.ok) {
      const text = await response.clone().text();
      console.error('[PROXY]', response.status, request.method, url.pathname, elapsed + 'ms', text.slice(0, 500));
    } else {
      console.log('[PROXY]', response.status, request.method, url.pathname, elapsed + 'ms');
    }

    return response;
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error('[PROXY TIMEOUT/ERRO]', request.method, url.pathname, elapsed + 'ms', err.message);

    // Retorna erro amigável
    return new Response(
      JSON.stringify({
        error: 'Serviço temporariamente indisponível',
        details: err.name === 'AbortError' ? 'Timeout' : err.message,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}