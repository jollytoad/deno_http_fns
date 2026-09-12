import { appendHeaders } from "@http/response/append-headers";
import type { Interceptors } from "./types.ts";

export interface CorsOptions {
  /**
   * The allowed origins of an `Origin` header, or `*` for any.
   */
  allowOrigin?: "*" | string[];

  /**
   * The allowed request methods, or `*` to allow any.
   */
  allowMethods?: "*" | string[];

  /**
   * The allowed request headers, or `*` to reflect the request's
   * `Access-Control-Request-Headers` value.
   */
  allowHeaders?: "*" | string[];

  /**
   * Allow cross-origin requests with cookies or Authorization header.
   */
  allowCredentials?: boolean;
}

/**
 * Set of interceptors to handle CORS (Cross-Origin Resource Sharing) requests.
 *
 * NOTE: This simply add the appropriate headers to the outgoing Response, your
 * handler needs to handle OPTIONS requests appropriately for CORS pre-flight
 * checks to work.
 *
 * If the `allowMethods` option is the `*` wildcard (the default if not given),
 * the if your OPTIONS response contains an [Allow](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Allow)
 * header, then the interceptor will use this for the [Access-Control-Allow-Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods)
 * header in the response.
 *
 * The simplest way to support CORS preflight properly is to make use of the
 * {@linkcode byMethod} helper which implicitly handles `OPTIONS` (and also `HEAD`)
 * for you.
 *
 * @example
 * ```ts
 * Deno.serve(intercept(byMethod({
 *   GET: handler
 * }), cors()));
 * ```
 *
 * @param opts configuration options
 */
export function cors(opts?: CorsOptions): Interceptors<unknown[], Response> {
  return {
    response: [addCorsHeaders(opts)],
  };
}

/**
 * Create a ResponseInterceptor that adds the appropriate CORS headers when required.
 *
 * @param opts configuration options
 * @returns a ResponseInterceptor that can be used with `intercept` or `interceptResponse`.
 */
export function addCorsHeaders(
  opts?: CorsOptions,
): (req: Request, res: Response) => Response {
  return (req, res) => {
    const origin = req.headers.get("Origin");

    if (origin && res) {
      const headers = new Headers();

      const allowOrigin = opts?.allowOrigin ?? "*";
      const allowMethods = opts?.allowMethods ?? "*";
      const allowHeaders = opts?.allowHeaders ?? "*";
      const allowCredentials = opts?.allowCredentials ?? false;

      // Per the Fetch CORS-preflight algorithm, only an `OPTIONS` request
      // carrying `Access-Control-Request-Method` is a preflight.
      const preflight = req.method === "OPTIONS" &&
        req.headers.has("Access-Control-Request-Method");

      const allowed = allowOrigin === "*"
        ? isGrantableOrigin(origin)
        : allowOrigin.includes(origin);

      if (!res.headers.has("Access-Control-Allow-Origin") && allowed) {
        headers.set("Access-Control-Allow-Origin", origin);
      }

      // CORS grant headers are only meaningful for an allowed origin.
      if (allowed) {
        if (preflight) {
          if (!res.headers.has("Access-Control-Allow-Methods")) {
            const methods = allowMethodsHeaderValue(
              res,
              allowMethods,
              allowCredentials,
            );
            if (methods) {
              headers.set("Access-Control-Allow-Methods", methods);
            }
          }

          if (!res.headers.has("Access-Control-Allow-Headers")) {
            const allowHeaderValue = allowHeadersHeaderValue(
              req,
              allowHeaders,
              allowCredentials,
            );
            if (allowHeaderValue) {
              headers.set("Access-Control-Allow-Headers", allowHeaderValue);
            }
          }
        } else if (!res.headers.has("Access-Control-Expose-Headers")) {
          headers.set("Access-Control-Expose-Headers", exposedHeaders(res));
        }

        if (allowCredentials) {
          headers.set("Access-Control-Allow-Credentials", "true");
        }
      }

      headers.append("Vary", "Origin");

      res = appendHeaders(res, headers);
    }

    return res;
  };
}

/**
 * An opaque (`null`) or multi-origin `Origin` value is never granted by the
 * wildcard. Explicitly listing such a value in `allowOrigin` still allows an
 * opt-in grant.
 */
function isGrantableOrigin(origin: string): boolean {
  return origin !== "null" && !/\s/.test(origin);
}

/**
 * The value of the `Access-Control-Allow-Methods` response header, or `""` to
 * omit the header entirely.
 *
 * Wildcard `*` is expanded from the response `Allow` header. For credentialed
 * requests a literal `*` is never emitted (Fetch CORS-preflight).
 */
function allowMethodsHeaderValue(
  res: Response,
  allowMethods: "*" | string[],
  allowCredentials: boolean,
): string {
  if (Array.isArray(allowMethods)) {
    return allowMethods.join(", ");
  }

  const expanded = res.headers.get("Allow");

  if (expanded) {
    return expanded;
  }

  return allowCredentials ? "" : "*";
}

/**
 * The value of the `Access-Control-Allow-Headers` response header, or `""` to
 * omit the header entirely.
 *
 * Wildcard `*` is reflected from the request's
 * `Access-Control-Request-Headers`. For credentialed requests a literal `*`
 * is never emitted (Fetch CORS-preflight), so reflect or omit instead.
 */
function allowHeadersHeaderValue(
  req: Request,
  allowHeaders: "*" | string[],
  allowCredentials: boolean,
): string {
  if (Array.isArray(allowHeaders)) {
    return allowHeaders.join(", ");
  }

  const requestHeaders = req.headers.get("Access-Control-Request-Headers");

  if (requestHeaders) {
    return requestHeaders;
  }

  return allowCredentials ? "" : "*";
}

const SAFELIST = new Set([
  "cache-control",
  "content-language",
  "content-length",
  "content-type",
  "expires",
  "last-modified",
  "pragma",
]);

// Header names that are never listed for `Access-Control-Expose-Headers`:
// the handler's own CORS grant headers and any `Allow` header.
const NON_EXPOSED = [/^access-control-/, /^allow$/];

/**
 * The comma-separated list of response header names that are not
 * CORS-safelisted, for `Access-Control-Expose-Headers`.
 */
function exposedHeaders(response: Response): string {
  const keys = [...response.headers.keys()];
  return keys.filter((key) => {
    const lower = key.toLowerCase();
    return !SAFELIST.has(lower) && !NON_EXPOSED.some((re) => re.test(lower));
  }).join(", ");
}
