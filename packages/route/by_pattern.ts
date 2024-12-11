import { asURLPatterns } from "./as_url_pattern.ts";
import type { Awaitable, RoutePattern } from "./types.ts";

/**
 * Create a Request handler that matches the URL of the Request based on a URLPattern.
 *
 * @param pattern the URL pattern to match against the Request URL
 * @param handler handler to call if the pattern matches, it should
 *  take the Request and the URLPatternResult as arguments
 * @template A the additional arguments passed to the handler
 * @template R the Response or an alternative response type
 * @returns a Request handler that returns a Response or null
 *
 * @example
 * ```ts
 * import { byPattern } from "@http/route/by-pattern";
 * import { handle } from "@http/route/handle";
 *
 * Deno.serve(handle([
 *   byPattern("/hello/:name", (_req, match) => {
 *     const { name } = match.pathname.groups;
 *     return new Response(`Hello ${name}!`);
 *   })
 * ]));
 * ```
 */
export function byPattern<A extends unknown[], R = Response>(
  pattern: RoutePattern,
  handler: (
    request: Request,
    match: URLPatternResult,
    ...args: A
  ) => Awaitable<R | null>,
): (req: Request, ...args: A) => Awaitable<R | null> {
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
