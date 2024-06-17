import type { RouteMapper } from "./types.ts";

/**
 * Combine multiple `RouteMapper`s into a single `RouteMapper`.
 *
 * Calls all given RouteMappers for a path and combined the results.
 *
 * @example
 * ```ts
 * export default combinedRouteMapper(
 *   tsRouteMapper,
 *   markdownRouteMapper,
 *   clientJsRouteMapper
 * );
 * ```
 *
 * (NOTE: `markdownRouteMapper`, and `clientJsRouteMapper` are just example names)
 *
 * @param mappers route mappers to be combined
 * @returns a single RouteMapper that may be used with `discoverRoutes`
 */
export function combinedRouteMapper(...mappers: RouteMapper[]): RouteMapper {
  return async function* (path) {
    for (const mapper of mappers) {
      yield* mapper(path);
    }
  };
}
