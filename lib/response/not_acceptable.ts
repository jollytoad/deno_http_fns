import { plainError } from "./plain_error.ts";

export function notAcceptable(message?: string): Response {
  return plainError(406, "Not Acceptable", message);
}
