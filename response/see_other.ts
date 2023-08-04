/**
 * Redirect with a "303 See Other" response.
 *
 * This is commonly used after a mutation request, such as a POST, PUT, PATCH, or DELETE
 * to redirect the browser via a GET request to a page to view the outcome of the operation,
 * so that a browser refresh will not issue another mutation request.
 */
export function seeOther(
  location: string | URL,
  headersInit?: HeadersInit,
): Response {
  const headers = new Headers(headersInit);
  headers.set(
    "Location",
    typeof location === "string" ? location : location.href,
  );
  return new Response(null, {
    status: 303,
    statusText: "See Other",
    headers,
  });
}
