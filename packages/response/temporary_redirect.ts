import { redirect } from "./redirect.ts";

/**
 * Create a `307 Temporary Redirect` response.
 *
 * @param location The absolute URL to redirect to
 * @param headersInit Additional headers
 */
export function temporaryRedirect(
  location: string | URL,
  headersInit?: HeadersInit,
): Response {
  return redirect(307, "Temporary Redirect", location, headersInit);
}
