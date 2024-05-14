import { plainError } from "./plain_error.ts";

/**
 * Create a `403 Forbidden` response
 *
 * @param message An optional message
 */
export function forbidden(message?: string): Response {
  return plainError(403, "Forbidden", message);
}
