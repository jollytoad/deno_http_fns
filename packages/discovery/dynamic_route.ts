import { byPattern } from "@http/route/by-pattern";
import { lazy } from "@http/route/lazy";
import { cascade } from "@http/route/cascade";
import {
  discoverRoutes,
  type DiscoverRoutesOptions,
} from "./discover_routes.ts";
import type { DiscoveredRoute } from "./types.ts";

export type Eagerness = "startup" | "request";

export interface DynamicRouteOptions extends DiscoverRoutesOptions {
  eagerness?: Eagerness;
}

/**
 * Create a handler that dynamically loads handler modules from the filesystem.
 *
 * It makes the assumption that the handler modules either export a default
 * function as the request handler, or a set of individual method handling functions,
 * (eg. GET, POST, PUT).
 *
 * @example
 * ```ts
 * Deno.serve(withFallback(
 *   dynamicRoute({
 *     fileRootUrl: import.meta.resolve("./routes"),
 *     verbose: true
 *   })
 * ));
 * ```
 *
 * @param pattern the root URL pattern, under which all found handlers are nested
 * @param fileRootUrl the root folder in the filesystem as a `file:` URL
 * @param eagerness whether route discovery will take place at `startup`,
 *   or will wait until the first `request` is made.
 * @returns a Request handler
 */
export function dynamicRoute(
  { eagerness = "startup", ...opts }: DynamicRouteOptions,
): (req: Request, ...args: unknown[]) => Promise<Response | null> {
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
  return byPattern(pattern, lazy(module, transformMethodExports));
}

async function transformMethodExports(loaded: unknown): Promise<unknown> {
  if (loaded && typeof loaded === "object" && !("default" in loaded)) {
    // assume module of individually exported http method functions
    const { byMethod } = await import("@http/route/by-method");
    return byMethod(loaded);
  }
  return loaded;
}
