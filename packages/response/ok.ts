/**
 * Create a `200 OK` response.
 * If body is null or undefined, a `204 No Content` is returned instead.
 *
 * @param body An optional body
 * @param headers Optional headers
 */
export function ok(body?: BodyInit | null, headers?: HeadersInit): Response {
  return new Response(body, {
    status: body === null || body === undefined ? 204 : 200,
    statusText: body === null || body === undefined ? "No Content" : "OK",
    headers,
  });
}
