import { plainError } from "./plain_error.ts";

export function badGateway(message?: string): Response {
  return plainError(502, "Bad Gateway", message);
}
