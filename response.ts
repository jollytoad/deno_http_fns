import {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.182.0/http/http_status.ts";

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

export function errorResponse(
  message?: string | null,
  status: Status = Status.BadRequest,
): Response {
  console.error(message);
  return response(status, message ?? STATUS_TEXT[status], {
    "Content-Type": "text/plain",
  });
}

export function noContent(): Response {
  return response(Status.NoContent);
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
