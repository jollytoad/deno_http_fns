import { plainError } from "./plain_error.ts";

export function forbidden(message?: string): Response {
  return plainError(403, "Forbidden", message);
}
