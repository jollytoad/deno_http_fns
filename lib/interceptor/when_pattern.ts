import { asURLPatterns } from "../as_url_pattern.ts";
import type { Awaitable, RoutePattern } from "../types.ts";

/**
 * Create a Request interceptor that filters the application of an
 * interceptor based on the URL of the Request matched against a URLPattern.
 *
 * @param pattern the URL pattern to match against the Request URL
 * @param interceptor interceptor to call if the pattern matches, it should
 *  take the Request and the URLPatternResult as arguments
 * @returns a Request interceptor that returns a Request, Response or void
 */
export function whenPattern<A extends unknown[]>(
  pattern: RoutePattern,
  interceptor: (
    request: Request,
    match: URLPatternResult,
    ...args: A
  ) => Awaitable<Request | Response | void>,
): (request: Request, ...args: A) => Awaitable<Request | Response | void> {
  const patterns = asURLPatterns(pattern);

  return (req: Request, ...args: A) => {
    for (const pattern of patterns) {
      const match = pattern.exec(req.url);

      if (match) {
        return interceptor(req, match, ...args);
      }
    }
  };
}
