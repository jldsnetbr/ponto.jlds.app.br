const SUPABASE_ORIGIN = 'https://sfpilqfqkuzqyswgyolx.supabase.co';

const API_PATHS = ['/auth/v1/', '/rest/v1/', '/storage/v1/', '/realtime/v1/'];

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

  const isApiRequest = API_PATHS.some(path => url.pathname.startsWith(path));

  if (!isApiRequest) {
    const response = await next();
    const ext = url.pathname.split('.').pop();
    const contentType = MIME_TYPES[ext];
    if (contentType) {
      const headers = new Headers(response.headers);
      headers.set('Content-Type', contentType);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
    return response;
  }

  const proxyUrl = new URL(url.pathname + url.search, SUPABASE_ORIGIN);

  return fetch(proxyUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
}
