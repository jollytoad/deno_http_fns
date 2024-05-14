import { headerEntries } from "./header_entries.ts";

/**
 * Set the given headers in the given Response.
 *
 * The headers will be merged directly into the headers of the Response
 * if the Response headers are mutable, otherwise a new Response will be created.
 *
 * @param res The response
 * @param headers The additional headers to be set in the response headers
 */
export function setHeaders(
  res: Response,
  headers: HeadersInit,
): Response {
  const entries = headerEntries(headers);

  function setToHeaders(headers: Headers) {
    for (const [name, value] of entries) {
      if (headers.get(name) !== value) {
        headers.set(name, value);
      }
    }
  }

  if (entries.length) {
    try {
      setToHeaders(res.headers);
    } catch {
      // Response headers were probably read-only, so create a new Response
      const headers = new Headers(res.headers);
      setToHeaders(headers);
      res = new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    }
  }

  return res;
}
