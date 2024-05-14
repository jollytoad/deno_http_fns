import { redirect } from "./redirect.ts";

/**
 * Create a `308 Permanent Redirect` response.
 *
 * Use this to indicate a resource has definitively moved to a new location.
 *
 * @param location The absolute URL to redirect to
 * @param headersInit Additional headers
 */
export function permanentRedirect(
  location: string | URL,
  headersInit?: HeadersInit,
): Response {
  return redirect(308, "Permanent Redirect", location, headersInit);
}
