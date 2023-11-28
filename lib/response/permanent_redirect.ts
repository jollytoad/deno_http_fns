import { redirect } from "./redirect.ts";

/**
 * Redirect with a "308 Permanent Redirect" response.
 */
export function permanentRedirect(
  location: string | URL,
  headersInit?: HeadersInit,
): Response {
  return redirect(308, "Permanent Redirect", location, headersInit);
}
