import { plainError } from "./plain_error.ts";

/**
 * Create a `400 Bad Request` response
 *
 * @param message An optional message
 */
export function badRequest(message?: string): Response {
  return plainError(400, "Bad Request", message);
}
