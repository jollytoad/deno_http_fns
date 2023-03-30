import { appendHeaders } from "./response.ts";

interface CorsOptions {
  allowOrigin?: "*" | string[];
  allowMethods?: "*" | string[];
  allowHeaders?: "*" | string[];
}

/**
 * Create a ResponseInterceptor that adds the appropriate CORS headers when required.
 *
 * @param opts configuration options
 * @returns a ResponseInterceptor that can be used with `intercept` or `interceptResponse`.
 */
export const cors = (opts?: CorsOptions) => {
  return (req: Request, res: Response) => {
    const origin = req.headers.get("Origin");

    if (origin) {
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

    if (req.method === "OPTIONS") {
      console.log(req.headers);
      console.log(res.headers);
    }

    return res;
  };
};

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
  const keys = [
    ...(response.headers as unknown as DomIterable<string, string>).keys(),
  ];
  return keys.filter((key) => !SAFELIST.has(key.toLowerCase())).join(", ");
}
