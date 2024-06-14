import type { DiscoveredPath, DiscoveredRoute } from "./types.ts";

/**
 * A RouteMapper that maps a discovered TypeScript module (ts/tsx) to itself.
 *
 * This is used as the default mapper if a `routeMapper` is not supplied to `discoverRoutes`.
 *
 * @example
 * ```ts
 * const routes = await discoverRoutes({
 *   routeMapper: tsRouteMapper
 * });
 * ```
 */
export function tsRouteMapper(
  { ext, pattern, module }: DiscoveredPath,
): DiscoveredRoute[] {
  switch (ext) {
    case ".ts":
    case ".tsx":
      return [{
        pattern,
        module,
      }];
  }
  return [];
}

export default tsRouteMapper;
