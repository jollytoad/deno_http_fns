/**
 * A RequestInterceptor that applies any `X-Forwarded-*` headers
 * to the URL of the Request object.
 *
 * NOTE: This interceptor must only be used when a trusted proxy that sets
 * these headers is guaranteed to be between the client and the server
 * (the proxy must strip client-supplied values). Enabling this interceptor
 * asserts that contract.
 *
 * Deno Deploy conveniently supplies you with a Request object with
 * the original URL, so this interceptor isn't required in Deploy.
 *
 * @example
 * ```ts
 * Deno.serve(intercept(handler, { request: applyForwardedHeaders }));
 * ```
 *
 * NOTE: The standard `Forwarded` header (RFC 7239) is not parsed, only the
 * `X-Forwarded-*` family.
 *
 * @param req The request
 * @returns either the original Request or a new Request with the adjusted URL
 */
export function applyForwardedHeaders(req: Request): Request {
  const proto = firstValue(req.headers.get("x-forwarded-proto"));
  const host = firstValue(req.headers.get("x-forwarded-host"));
  const port = firstValue(req.headers.get("x-forwarded-port"));

  if (proto || host || port) {
    const url = new URL(req.url);
    url.protocol = proto ?? url.protocol;
    url.host = host ?? url.host;

    // A `port` header only fills in a gap — if the forwarded host already
    // carries its own port, it describes the same origin node (RFC 7239 §4.1).
    if (host && !host.includes(":")) {
      url.port = port ?? url.port;
    }

    return new Request(url, req);
  }

  return req;
}

/**
 * The value of the first (leftmost) list item of a possibly comma-joined
 * header value, without optional surrounding whitespace.
 *
 * Per RFC 9110 §5.3 / RFC 7239 §4, the leftmost value of a combined field
 * is the one added closest to the client.
 */
function firstValue(value: string | null): string {
  if (!value) {
    return "";
  }
  const comma = value.indexOf(",");
  const first = comma === -1 ? value : value.slice(0, comma);
  return first.trim();
}
