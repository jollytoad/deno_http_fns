import { byPattern } from "./by_pattern.ts";
import type { Awaitable } from "@http/handler/types";
import type { RoutePattern } from "./types.ts";
import { deepMerge } from "@std/collections/deep-merge";

/**
 * Match a child route pattern after already matching a parent pattern,
 * and merge the URLPatternResults.
 */
export function bySubPattern<A extends unknown[]>(
  pattern: RoutePattern,
  handler: (
    request: Request,
    match: URLPatternResult,
    ...args: A
  ) => Awaitable<Response | null>,
): (
  req: Request,
  matchParent: URLPatternResult,
  ...args: A
) => Awaitable<Response | null> {
  return byPattern(pattern, mergePatternResult(handler));
}

/**
 * Create a handler that merges two URLPatternResults from the args,
 * and calls the given handle with the merged result as a single arg.
 */
export function mergePatternResult<A extends unknown[]>(
  handler: (
    request: Request,
    match: URLPatternResult,
    ...args: A
  ) => Awaitable<Response | null>,
): (
  req: Request,
  matchChild: URLPatternResult,
  matchParent: URLPatternResult,
  ...args: A
) => Awaitable<Response | null> {
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