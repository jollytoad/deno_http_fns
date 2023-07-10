import type {
  Args,
  CustomHandler,
  PathPattern,
  RoutePattern,
} from "./types.ts";

export type RouteHandler = CustomHandler<[URLPatternResult]>;

/**
 * Create a Request handler that matches the URL of the Request based on a URLPattern.
 *
 * @param pattern the URL pattern to match against the Request URL
 * @param handler handler to call if the pattern matches, it should
 *  take the Request and the URLPatternResult as arguments
 * @returns a Request handler that returns a Response or null
 */
export function byPattern<A extends Args>(
  pattern: RoutePattern,
  handler: RouteHandler,
): CustomHandler<A> {
  return async (req, ..._args) => {
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    const url = new URL(req.url);

    for (const pattern of patterns) {
      const match = asURLPattern(pattern).exec(url);

      if (match) {
        const res = await handler(req, match);
        if (res) {
          return res;
        }
      }
    }

    return null;
  };
}

/**
 * Convert a single RoutePattern to a URLPattern.
 */
export function asURLPattern(
  pattern: PathPattern | URLPatternInit | URLPattern,
): URLPattern {
  return typeof pattern === "string"
    ? new URLPattern({ pathname: pattern })
    : pattern instanceof URLPattern
    ? pattern
    : new URLPattern(pattern);
}
