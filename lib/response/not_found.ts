import { plainError } from "./plain_error.ts";

export function notFound(message?: string): Response {
  return plainError(404, "Not Found", message);
}
