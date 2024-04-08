import { plainError } from "./plain_error.ts";

/**
 * Create a `404 Not Found` response
 *
 * @param message An optional message
 */
export function notFound(message?: string): Response {
  return plainError(404, "Not Found", message);
}
