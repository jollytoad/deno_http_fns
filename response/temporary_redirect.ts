import { redirect } from "./redirect.ts";

/**
 * Redirect with a "307 Temporary Redirect" response.
 */
export function temporaryRedirect(
  location: string | URL,
  headersInit?: HeadersInit,
): Response {
  return redirect(307, "Temporary Redirect", location, headersInit);
}
