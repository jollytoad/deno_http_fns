import { plainError } from "./plain_error.ts";

/**
 * Create a `405 Method Not Allowed` response
 *
 * Per RFC 9110 §15.5.5 the response MUST include an `Allow` header listing
 * the methods supported by the target resource.
 *
 * @param message An optional message
 * @param allow The list of methods allowed by the target resource
 *
 * @example Usage with a string of methods
 * ```ts
 * methodNotAllowed(undefined, "GET, HEAD, OPTIONS");
 * ```
 *
 * @example Usage with an array of methods
 * ```ts
 * methodNotAllowed("Only GET is allowed", ["GET", "OPTIONS"]);
 * ```
 */
export function methodNotAllowed(
  message?: string,
  allow?: string | string[],
): Response {
  if (Array.isArray(allow)) {
    allow = allow.join(", ");
  }
  return plainError(
    405,
    "Method Not Allowed",
    message,
    allow ? { allow } : undefined,
  );
}
