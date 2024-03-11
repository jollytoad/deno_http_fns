/**
 * Create a `304 Not Modified` response.
 *
 * @param headers Optional headers
 */
export function notModified(headers?: HeadersInit): Response {
  return new Response(null, {
    status: 304,
    statusText: "Not Modified",
    headers,
  });
}
