/**
 * @module
 * @deprecated use `response/*.ts` modules directly instead.
 */

import {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.197.0/http/http_status.ts";

export * from "./response/ok.ts";
export * from "./response/json.ts";
export * from "./response/html.ts";
export * from "./response/no_content.ts";
export * from "./response/see_other.ts";
export * from "./response/bad_request.ts";
export * from "./response/method_not_allowed.ts";
export * from "./response/not_acceptable.ts";
export * from "./response/not_found.ts";
export * from "./response/forbidden.ts";
export * from "./response/replace_body.ts";
export * from "./response/append_headers.ts";

/**
 * @deprecated just use `new Response`
 */
export function response(
  status: Status,
  body?: BodyInit | null,
  headers?: HeadersInit,
): Response {
  return new Response(body, {
    status,
    statusText: STATUS_TEXT[status],
    headers,
  });
}

/**
 * @deprecated just use `new Response`, or `plainError`
 */
export function errorResponse(
  message?: string | null,
  status: Status = Status.BadRequest,
): Response {
  return response(status, message ?? STATUS_TEXT[status], {
    "Content-Type": "text/plain",
  });
}
