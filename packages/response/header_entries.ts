/**
 * Get an array of header key/value pairs from various objects.
 *
 * @param headers An object representing or containing headers in some form
 */
export function headerEntries(
  headers: Request | Response | Headers | HeadersInit,
): [key: string, value: string][] {
  return headers instanceof Request || headers instanceof Response
    ? headerEntries(headers.headers)
    : isHeaders(headers)
    ? [...headers.entries()]
    : Array.isArray(headers)
    ? headers
    : Object.entries(headers);
}

function isHeaders(
  headers: HeadersInit,
): headers is Headers & DomIterable<string, string> {
  return headers instanceof Headers;
}
