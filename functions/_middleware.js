const SUPABASE_ORIGIN = 'https://sfpilqfqkuzqyswgyolx.supabase.co';

const API_PATHS = ['/auth/v1/', '/rest/v1/', '/storage/v1/', '/realtime/v1/'];

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  const isApiRequest = API_PATHS.some(path => url.pathname.startsWith(path));

  if (!isApiRequest) {
    return next();
  }

  const proxyUrl = new URL(url.pathname + url.search, SUPABASE_ORIGIN);

  return fetch(proxyUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
}
