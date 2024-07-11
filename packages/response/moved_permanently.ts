import { redirect } from "./redirect.ts";

/**
 * Create a `301 Moved Permanently` response.
 *
 * Use this to indicate a resource has definitively moved to a new location,
 * in response to GET or HEAD requests only.
 *
 * @param location The absolute URL to redirect to
 * @param headersInit Additional headers
 */
export function movedPermanently(
  location: string | URL,
  headersInit?: HeadersInit,
): Response {
  return redirect(301, "Moved Permanently", location, headersInit);
}
