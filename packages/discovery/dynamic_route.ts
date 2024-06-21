import { byPattern } from "@http/route/by-pattern";
import { lazy } from "@http/route/lazy";
import { cascade } from "@http/route/cascade";
import {
  discoverRoutes,
  type DiscoverRoutesOptions,
} from "./discover_routes.ts";
import type { DiscoveredRoute, HandlerMapper } from "./types.ts";
import { cascadingHandlerMapper } from "./cascading_handler_mapper.ts";

export type Eagerness = "startup" | "request";

export interface DynamicRouteOptions extends DiscoverRoutesOptions {
  /**
   * Should the handler be built at app startup or when we get the
   * first request. Defaults to `startup`.
   */
  eagerness?: Eagerness;

  /**
   * Function to map a loaded module to an actual Request handler.
   *
   * The default behaviour is to assume a default exported function is the
   * handler, otherwise any named function exports are assumed to be individual
   * method handling functions.
   */
  handlerMapper?: HandlerMapper;
}

/**
 * Create a handler that dynamically loads handler modules from the filesystem.
 *
 * It makes the assumption that the handler modules either export a default
 * function as the request handler, or a set of individual method handling functions,
 * (eg. GET, POST, PUT). Unless a custom `handlerMapper` is provided.
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
 * @param handlerMapper a custom module -> request handler mapping function.
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
  const handlerMapper = opts.handlerMapper ?? cascadingHandlerMapper(
    (await import("./default_handler_mapper.ts")).default,
    (await import("./methods_handler_mapper.ts")).default,
  );

  return cascade(...(await discoverRoutes(opts)).map(asLazyRoute));

  function asLazyRoute({ pattern, module }: DiscoveredRoute) {
    return byPattern(pattern, lazy(module, transformModule));

    function transformModule(loaded: unknown) {
      if (isModule(loaded)) {
        return handlerMapper({ pattern, module, loaded });
      } else {
        return () => null;
      }
    }
  }
}

function isModule(loaded: unknown): loaded is Record<string, unknown> {
  return !!loaded && typeof loaded === "object";
}
