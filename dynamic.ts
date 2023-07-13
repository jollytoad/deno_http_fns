import { byPattern } from "./pattern.ts";
import { lazy } from "./lazy.ts";
import { cascade } from "./cascade.ts";
import {
  type DiscoveredRoute,
  discoverRoutes,
  type DiscoverRoutesOptions,
} from "./discover_routes.ts";

export type Eagerness = "startup" | "request";

export interface DynamicRouteOptions extends DiscoverRoutesOptions {
  eagerness?: Eagerness;
}

/**
 * Create a handler that dynamically loads handler modules from the filesystem.
 *
 * @param pattern the root URL pattern, under which all found handlers are nested
 * @param fileRootUrl the root folder in the filesystem as a `file:` URL
 * @param eagerness whether route discovery will take place at `startup`,
 *   or will wait until the first `request` is made.
 * @returns a Request handler
 */
export function dynamicRoute(
  { eagerness = "startup", ...opts }: DynamicRouteOptions,
) {
  switch (eagerness) {
    case "startup": {
      // Build the handler eagerly, before the first request is made
      const handlerPromise = buildHandler(opts);
      return lazy(() => handlerPromise);
    }

    case "request": {
      // Build the handler lazily, when the first request is made
      return lazy(() => buildHandler(opts));
    }
  }
}

async function buildHandler(opts: DynamicRouteOptions) {
  return cascade(...(await discoverRoutes(opts)).map(asLazyRoute));
}

function asLazyRoute({ pattern, module }: DiscoveredRoute) {
  return byPattern(pattern, lazy(module));
}
