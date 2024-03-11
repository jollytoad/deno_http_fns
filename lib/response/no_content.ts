/**
 * Create a `204 No Content` response.
 *
 * @param headers Optional headers
 */
export function noContent(headers?: HeadersInit): Response {
  return new Response(null, {
    status: 204,
    statusText: "No Content",
    headers,
  });
}
