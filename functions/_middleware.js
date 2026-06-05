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
