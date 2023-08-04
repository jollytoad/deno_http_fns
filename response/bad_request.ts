import { plainError } from "./plain_error.ts";

export function badRequest(message?: string): Response {
  return plainError(400, "Bad Request", message);
}
