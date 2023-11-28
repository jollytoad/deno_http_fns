import { asURLPattern } from "./as_url_pattern.ts";
import type { Awaitable, RoutePattern } from "./types.ts";

/**
 * Create a Request handler that matches the URL of the Request based on a URLPattern.
 *
 * @param pattern the URL pattern to match against the Request URL
 * @param handler handler to call if the pattern matches, it should
 *  take the Request and the URLPatternResult as arguments
 * @returns a Request handler that returns a Response or null
 */
export function byPattern<A extends unknown[]>(
  pattern: RoutePattern,
  handler: (
    request: Request,
    match: URLPatternResult,
    ...args: A
  ) => Awaitable<Response | null>,
) {
  return async (req: Request, ...args: A) => {
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    const url = new URL(req.url);

    for (const pattern of patterns) {
      const match = asURLPattern(pattern).exec(url);

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
