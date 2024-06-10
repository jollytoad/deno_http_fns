import { appendHeaders } from "@http/response/append-headers";
import type { Interceptors } from "./types.ts";

export interface CorsOptions {
  allowOrigin?: "*" | string[];
  allowMethods?: "*" | string[];
  allowHeaders?: "*" | string[];
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

      const allow = res.headers.get("Allow");
      const requestHeaders = req.headers.get("Access-Control-Request-Headers");

      if (!res.headers.has("Access-Control-Allow-Origin")) {
        if (allowOrigin === "*" || allowOrigin.includes(origin)) {
          headers.set("Access-Control-Allow-Origin", origin);
        }
      }

      if (req.method === "OPTIONS") {
        if (!res.headers.has("Access-Control-Allow-Methods")) {
          if (allowMethods === "*" && allow) {
            headers.set("Access-Control-Allow-Methods", allow);
          } else {
            headers.set(
              "Access-Control-Allow-Methods",
              Array.isArray(allowMethods)
                ? allowMethods.join(", ")
                : allowMethods,
            );
          }
        }

        if (!res.headers.has("Access-Control-Allow-Headers")) {
          if (allowHeaders === "*" && requestHeaders) {
            headers.set("Access-Control-Allow-Headers", requestHeaders);
          } else {
            headers.set(
              "Access-Control-Allow-Headers",
              Array.isArray(allowHeaders)
                ? allowHeaders.join(", ")
                : allowHeaders,
            );
          }
        }
      } else {
        if (!res.headers.has("Access-Control-Expose-Headers")) {
          headers.set("Access-Control-Expose-Headers", exposedHeaders(res));
        }
      }

      headers.append("Vary", "Origin");

      res = appendHeaders(res, headers);
    }

    return res;
  };
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

function exposedHeaders(response: Response) {
  const keys = [...response.headers.keys()];
  return keys.filter((key) => !SAFELIST.has(key.toLowerCase())).join(", ");
}
