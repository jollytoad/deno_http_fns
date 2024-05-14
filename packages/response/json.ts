/**
 * Create a `200 OK` response with a JSON serialized body.
 * Will also add the appropriate Content-Type header.
 *
 * @param body Any JSON serializable value
 * @param headersInit Additional headers
 */
export function json(body: unknown, headersInit?: HeadersInit): Response {
  const headers = new Headers(headersInit);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(body), {
    status: 200,
    statusText: "OK",
    headers,
  });
}
