import { plainError } from "./plain_error.ts";

/**
 * Create a `406 Not Acceptable` response
 *
 * @param message An optional message
 */
export function notAcceptable(message?: string): Response {
  return plainError(406, "Not Acceptable", message);
}
