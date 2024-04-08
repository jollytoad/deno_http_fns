/**
 * Create a redirect response, with a Location header.
 *
 * This is a general purpose function used by the other redirect
 * response functions, prefer using those over this.
 *
 * @param status HTTP status code
 * @param statusText HTTP status text
 * @param location The absolute URL to redirect to
 * @param headersInit Additional headers
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
