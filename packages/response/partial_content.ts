/**
 * Create a `206 Partial Content` response.
 *
 * @param body The body of partial content
 * @param headers The headers, should include `Content-Range`
 */
export function partialContent(body: BodyInit, headers: HeadersInit): Response {
  return new Response(body, {
    status: 206,
    statusText: "Partial Content",
    headers,
  });
}
