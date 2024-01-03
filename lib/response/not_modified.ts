export function notModified(headers?: HeadersInit): Response {
  return new Response(null, {
    status: 304,
    statusText: "Not Modified",
    headers,
  });
}
