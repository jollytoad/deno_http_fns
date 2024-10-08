/**
 * A RequestInterceptor that applies any `X-Forwarded-*` headers
 * to the URL of the Request object.
 *
 * Useful where your server may be behind a proxy that forwards the
 * request and set these headers.
 *
 * Deno Deploy conveniently supplies you with a Request object with
 * the original URL, so this interceptor isn't required in Deploy.
 *
 * @example
 * ```ts
 * Deno.serve(intercept(handler, { request: applyForwardedHeaders }));
 * ```
 *
 * TODO: check and parse the `Forwarded` header too.
 *
 * @param req The request
 * @returns either the original Request or a new Request with the adjusted URL
 */
export function applyForwardedHeaders(req: Request): Request {
  const proto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("x-forwarded-host");
  const port = req.headers.get("x-forwarded-port");

  if (proto || host || port) {
    const url = new URL(req.url);
    url.protocol = proto ?? url.protocol;
    url.host = host ?? url.host;
    url.port = port ?? url.port;
    return new Request(url, req);
  }

  return req;
}
