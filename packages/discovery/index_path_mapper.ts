import type { DiscoveredPath } from "./types.ts";

/**
 * A PathMapper that adjusts 'index' patterns to be the parent path with optional trailing slash.
 *
 * For example:
 *
 * - `/index` => `/`
 * - `/foo/index` => `/foo{/}?`
 *
 * This is the default mapper if a `pathMapper` is not supplied to `discoverRoutes`.
 *
 * @example
 * ```ts
 * const routes = await discoverRoutes({
 *   pathMapper: indexPathMapper
 * });
 * ```
 */
export function indexPathMapper(entry: DiscoveredPath): DiscoveredPath {
  if (entry.name === "index") {
    return {
      ...entry,
      pattern: entry.pattern === "/index"
        ? "/"
        : entry.pattern.replace(/\/index$/, "{/}?"),
    };
  }
  return entry;
}

export default indexPathMapper;
