import { byPattern } from "./by_pattern.ts";
import type { Awaitable, RoutePattern } from "./types.ts";
import { deepMerge } from "@std/collections/deep-merge";

/**
 * Match a child route pattern after already matching a parent pattern,
 * and merge the URLPatternResults.
 *
 * @param pattern the pattern to match, this still matches against the full path, so should start with `*\/`
 *  to account for the matched parent part.
 * @param handler handler to call if the pattern matches, it should
 *  take the Request and the URLPatternResult as arguments
 * @template A the additional arguments passed to the handler
 * @template R the Response or an alternative response type
 * @returns a Request handler that returns a Response or null
 *
 * @example
 * ```ts
 * Deno.serve(handle([
 *   byPattern(
 *     "/:foo/*",
 *     bySubPattern("*\/:bar", (_req, match) => {
 *       const { foo, bar } = match.pathname.groups;
 *       return new Response(`:foo = ${foo}, :bar = ${bar}`);
 *     })
 *   })
 * ]));
 * ```
 */
export function bySubPattern<A extends unknown[], R = Response>(
  pattern: RoutePattern,
  handler: (
    request: Request,
    match: URLPatternResult,
    ...args: A
  ) => Awaitable<R | null>,
): (
  req: Request,
  matchParent: URLPatternResult,
  ...args: A
) => Awaitable<R | null> {
  return byPattern(pattern, mergePatternResult(handler));
}

/**
 * Create a handler that merges two URLPatternResults from the args,
 * and calls the given handle with the merged result as a single arg.
 *
 * @param handler handler to call with the merged URLPatternResult
 * @template A the additional arguments passed to the handler (after all URLPatternResult args)
 * @template R the Response or an alternative response type
 * @returns a Request handler that accepts the Request followed by two URLPatternResult args
 */
export function mergePatternResult<A extends unknown[], R = Response>(
  handler: (
    request: Request,
    match: URLPatternResult,
    ...args: A
  ) => Awaitable<R | null>,
): (
  req: Request,
  matchChild: URLPatternResult,
  matchParent: URLPatternResult,
  ...args: A
) => Awaitable<R | null> {
  return (
    req: Request,
    matchChild: URLPatternResult,
    matchParent: URLPatternResult,
    ...args: A
  ) => {
    return handler(
      req,
      deepMergeURLPatternResult(matchParent, matchChild),
      ...args,
    );
  };
}

function deepMergeURLPatternResult(a: URLPatternResult, b: URLPatternResult) {
  // deno-lint-ignore no-explicit-any
  return deepMerge(a as any, b as any, {
    arrays: "replace",
  }) as unknown as URLPatternResult;
}
