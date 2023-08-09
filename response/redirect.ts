/**
 * Create a redirect response, with a Location header.
 */
export function redirect(
  status: number,
  statusText: string,
  location: string | URL,
  headersInit?: HeadersInit,
): Response {
  const headers = new Headers(headersInit);
  headers.set(
    "Location",
    typeof location === "string" ? location : location.href,
  );
  return new Response(null, {
    status,
    statusText,
    headers,
  });
}
