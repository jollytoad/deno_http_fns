/**
 * Create a `200 OK` response with an HTML body.
 * Will also add the appropriate Content-Type header.
 *
 * @param body HTML content
 * @param headersInit Additional headers
 */
export function html(body: BodyInit, headersInit?: HeadersInit): Response {
  const headers = new Headers(headersInit);
  headers.set("Content-Type", "text/html");
  return new Response(body, {
    status: 200,
    statusText: "OK",
    headers,
  });
}
