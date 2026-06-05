const SUPABASE_ORIGIN = 'https://sfpilqfqkuzqyswgyolx.supabase.co';

const API_PATHS = ['/auth/v1/', '/rest/v1/', '/storage/v1/'];

const MIME_TYPES = {
  js: 'text/javascript',
  css: 'text/css',
  png: 'image/png',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  json: 'application/json',
  webmanifest: 'application/manifest+json',
};

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  const isApi = API_PATHS.some(path => url.pathname.startsWith(path));

  if (!isApi) {
    const response = await next();
    const ext = url.pathname.split('.').pop();
    const ct = MIME_TYPES[ext];
    if (ct) {
      const headers = new Headers(response.headers);
      headers.set('Content-Type', ct);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
    return response;
  }

  const proxyUrl = new URL(url.pathname + url.search, SUPABASE_ORIGIN);
  const headers = new Headers(request.headers);
  headers.delete('content-length');
  const body = request.method === 'GET' || request.method === 'HEAD' ? null : await request.text();

  const response = await fetch(proxyUrl.toString(), {
    method: request.method,
    headers,
    body,
  });

  if (!response.ok) {
    console.error('[PROXY]', response.status, request.method, url.pathname, await response.clone().text());
  }

  return response;
}
