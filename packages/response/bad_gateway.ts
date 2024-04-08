import { plainError } from "./plain_error.ts";

/**
 * Create a `502 Bad Gateway` response
 *
 * @param message An optional message
 */
export function badGateway(message?: string): Response {
  return plainError(502, "Bad Gateway", message);
}
