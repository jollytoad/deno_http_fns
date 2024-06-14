import type { ComparableRoute } from "./types.ts";

/**
 * Really dumb string comparison of the pathname of the URLPattern.
 *
 * This is the default comparator if a `compare` option is not supplied to `discoverRoutes`.
 *
 * @example
 * ```ts
 * const routes = await discoverRoutes({
 *   compare: pathnameLexicalRouteComparator
 * });
 * ```
 */
export function pathnameLexicalRouteComparator(
  { pattern: { pathname: a } }: ComparableRoute,
  { pattern: { pathname: b } }: ComparableRoute,
): number {
  // TODO: Sort using something like URLPattern.compareComponent if it becomes available
  // See: https://github.com/WICG/urlpattern/issues/61
  return a === b ? 0 : a > b ? -1 : 1;
}

export default pathnameLexicalRouteComparator;
