/**
 * Create a `202 Accepted` response
 *
 * @param body Optional body
 * @param headers Optional headers
 */
export function accepted(
  body?: BodyInit | null,
  headers?: HeadersInit,
): Response {
  return new Response(body, {
    status: 202,
    statusText: "Accepted",
    headers,
  });
}
