import { asURLPatterns } from "./as_url_pattern.ts";
import type { Awaitable } from "@http/handler/types";
import type { RoutePattern } from "./types.ts";

/**
 * Create a Request handler that matches the URL of the Request based on a URLPattern.
 *
 * @param pattern the URL pattern to match against the Request URL
 * @param handler handler to call if the pattern matches, it should
 *  take the Request and the URLPatternResult as arguments
 * @template A the additional arguments passed to the handler
 * @returns a Request handler that returns a Response or null
 */
export function byPattern<A extends unknown[]>(
  pattern: RoutePattern,
  handler: (
    request: Request,
    match: URLPatternResult,
    ...args: A
  ) => Awaitable<Response | null>,
): (req: Request, ...args: A) => Awaitable<Response | null> {
  const patterns = asURLPatterns(pattern);

  return async (req: Request, ...args: A) => {
    for (const pattern of patterns) {
      const match = pattern.exec(req.url);

      if (match) {
        const res = await handler(req, match, ...args);
        if (res) {
          return res;
        }
      }
    }

    return null;
  };
}
