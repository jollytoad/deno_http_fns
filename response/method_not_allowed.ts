import { plainError } from "./plain_error.ts";

export function methodNotAllowed(message?: string): Response {
  return plainError(405, "Method Not Allowed", message);
}
