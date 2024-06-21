import type { MethodHandlers } from "@http/route/types";
import type { RequestHandler, RouteModule } from "./types.ts";

/**
 * A `HandlerMapper` that treats the exported functions of a module as individual request method handlers.
 *
 * It simply wraps the module with {@linkcode byMethod} if it determines that at least one function looks
 * like a HTTP method name.
 */
export async function methodsHandlerMapper(
  { loaded }: RouteModule,
): Promise<RequestHandler | undefined> {
  if (hasMethodHandlers(loaded)) {
    const { byMethod } = await import("@http/route/by-method");
    return byMethod(loaded);
  }
}

/**
 * Does the route module export any functions that have an all-uppercase HTTP method-like name?
 */
export function hasMethodHandlers(
  loaded: Record<string, unknown>,
): loaded is MethodHandlers {
  return !!loaded.GET || !!loaded.POST || !!loaded.PUT || !!loaded.PATCH ||
    !!loaded.DELETE ||
    Object.keys(loaded).some((name) => /^[A-Z\-]+$/.test(name));
}

export default methodsHandlerMapper;
