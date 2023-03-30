import type { Args, CustomHandler } from "./types.ts";

export type RouteHandler = CustomHandler<[URLPatternResult]>;

/**
 * Create a Request handler that matches the URL of the Request based on a URLPattern.
 *
 * @param pattern the URL pattern to match against the Request URL
 * @param handler handler to call if the pattern matches, it should
 *  take the Request and the URLPatternResult as arguments
 * @returns a Request handler that returns a Response or null
 */
export const byPattern = <A extends Args>(
  pattern: URLPatternInput | URLPattern | Array<URLPatternInput | URLPattern>,
  handler: RouteHandler,
): CustomHandler<A> =>
async (req, ..._args) => {
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  const url = new URL(req.url);

  for (const pattern of patterns) {
    const match = typeof pattern === "string"
      ? new URLPattern({ pathname: pattern }).exec(url)
      : pattern instanceof URLPattern
      ? pattern.exec(url)
      : new URLPattern(pattern).exec(url);

    if (match) {
      console.debug("Matched", pattern);
      const res = await handler(req, match);
      if (res) {
        return res;
      }
    }
  }

  return null;
};
