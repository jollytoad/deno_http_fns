import { plainError } from "./plain_error.ts";

/**
 * Create a `405 Method Not Allowed` response
 *
 * @param message An optional message
 */
export function methodNotAllowed(message?: string): Response {
  return plainError(405, "Method Not Allowed", message);
}
