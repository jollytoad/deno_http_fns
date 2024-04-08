/**
 * Append the given headers to the given Response.
 *
 * The headers will be merged directly into the headers of the Response
 * if the Response headers are mutable, otherwise a new Response will be created.
 *
 * @param res The response
 * @param headers The additional headers to be appended to the response headers
 */
export function appendHeaders(
  res: Response,
  headers: HeadersInit,
): Response {
  const entries = isHeaders(headers)
    ? [...headers.entries()]
    : Array.isArray(headers)
    ? headers
    : Object.entries(headers);

  function appendToHeaders(headers: Headers) {
    for (const [name, value] of entries) {
      headers.append(name, value);
    }
  }

  if (entries.length) {
    try {
      appendToHeaders(res.headers);
    } catch {
      // Response headers were probably read-only, so create a new Response
      const headers = new Headers(res.headers);
      appendToHeaders(headers);
      res = new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    }
  }

  return res;
}

function isHeaders(
  headers: HeadersInit,
): headers is Headers & DomIterable<string, string> {
  return headers instanceof Headers;
}
