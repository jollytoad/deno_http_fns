import {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.192.0/http/http_status.ts";

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

export function ok(body?: BodyInit | null, headers?: HeadersInit): Response {
  return response(body ? Status.OK : Status.NoContent, body, headers);
}

export function noContent(): Response {
  return response(Status.NoContent);
}

export function json(body: unknown, headersInit?: HeadersInit): Response {
  const headers = new Headers(headersInit);
  headers.set("Content-Type", "application/json");
  return response(Status.OK, JSON.stringify(body), headers);
}

export function html(body: BodyInit, headersInit?: HeadersInit): Response {
  const headers = new Headers(headersInit);
  headers.set("Content-Type", "text/html");
  return response(Status.OK, body, headers);
}

export function seeOther(
  location: string | URL,
  headersInit?: HeadersInit,
): Response {
  const headers = new Headers(headersInit);
  headers.set(
    "Location",
    typeof location === "string" ? location : location.href,
  );
  return response(Status.SeeOther, null, headers);
}

export function errorResponse(
  message?: string | null,
  status: Status = Status.BadRequest,
): Response {
  return response(status, message ?? STATUS_TEXT[status], {
    "Content-Type": "text/plain",
  });
}

export function badRequest(message?: string | null): Response {
  return errorResponse(message);
}

export function methodNotAllowed(): Response {
  return errorResponse(null, Status.MethodNotAllowed);
}

export function notAcceptable(): Response {
  return errorResponse(null, Status.NotAcceptable);
}

export function notFound(message?: string | null): Response {
  return errorResponse(message, Status.NotFound);
}

export function forbidden(message?: string | null): Response {
  return errorResponse(message, Status.Forbidden);
}

export function replaceBody(res: Response, body: BodyInit | null) {
  return new Response(body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}

export function appendHeaders(
  res: Response,
  headers: HeadersInit,
): Response {
  const entries = isHeaders(headers)
    ? [...headers.entries()]
    : Array.isArray(headers)
    ? headers
    : Object.entries(headers);

  function appendToHeaders(headers: Headers) {
    for (const [name, value] of entries) {
      headers.append(name, value);
    }
  }

  if (entries.length) {
    try {
      appendToHeaders(res.headers);
    } catch {
      // Response headers were probably read-only, so create a new Response
      const headers = new Headers(res.headers);
      appendToHeaders(headers);
      res = new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    }
  }

  return res;
}

function isHeaders(
  headers: HeadersInit,
): headers is Headers & DomIterable<string, string> {
  return headers instanceof Headers;
}
