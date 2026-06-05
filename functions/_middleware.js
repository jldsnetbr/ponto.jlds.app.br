const SUPABASE = 'https://sfpilqfqkuzqyswgyolx.supabase.co';

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
    body = await request.text();
  }

  const start = Date.now();
  const response = await fetch(upstream, { method: request.method, headers, body });
  const elapsed = Date.now() - start;

  if (!response.ok) {
    const text = await response.clone().text();
    console.error('[PROXY]', response.status, request.method, url.pathname, elapsed + 'ms', text.slice(0, 500));
  } else {
    console.log('[PROXY]', response.status, request.method, url.pathname, elapsed + 'ms');
  }

  return response;
}
