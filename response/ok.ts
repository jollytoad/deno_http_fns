export function ok(body?: BodyInit | null, headers?: HeadersInit): Response {
  return new Response(body, {
    status: body === null || body === undefined ? 204 : 200,
    statusText: body === null || body === undefined ? "No Content" : "OK",
    headers,
  });
}
