import { discoverRoutes } from "@http/discovery/discover-routes";
import { combinedRouteMapper } from "@http/discovery/combined-route-mapper";
import type { GenerateOptions } from "./types.ts";
import type { DiscoveredRoute } from "@http/discovery/types";

export async function discoverRoutesForGen(
  opts: GenerateOptions,
): Promise<DiscoveredRoute[]> {
  const {
    pattern = "/",
    fileRootUrl,
    verbose = false,
  } = opts;

  const pathMapper = opts.pathMapper
    ? (await import(opts.pathMapper.toString())).default
    : undefined;

  const routeMapper = opts.routeMapper
    ? Array.isArray(opts.routeMapper)
      ? combinedRouteMapper(
        ...await Promise.all(opts.routeMapper.map(async (routeMapper) =>
          (await import(routeMapper.toString())).default
        )),
      )
      : (await import(opts.routeMapper.toString())).default
    : undefined;

  const compare = opts.compare
    ? (await import(opts.compare.toString())).default
    : undefined;

  return await discoverRoutes({
    pattern,
    fileRootUrl,
    pathMapper,
    routeMapper,
    compare,
    consolidate: true,
    verbose,
  });
}
