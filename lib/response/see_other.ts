import { redirect } from "./redirect.ts";

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
  return redirect(303, "See Other", location, headersInit);
}
