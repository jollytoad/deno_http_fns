import type { RequestHandler, RouteModule } from "./types.ts";

/**
 * A `HandlerMapper` that use the default exported function as the request handler for the route.
 */
export function defaultHandlerMapper(
  { loaded }: RouteModule,
): RequestHandler | undefined {
  if (hasDefaultHandler(loaded)) {
    return loaded.default;
  }
}

/**
 * Does the route module export a default function?
 */
export function hasDefaultHandler(
  loaded: Record<string, unknown>,
): loaded is { default: RequestHandler } {
  return "default" in loaded && typeof loaded.default === "function";
}

export default defaultHandlerMapper;
