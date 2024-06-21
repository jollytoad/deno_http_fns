import type { HandlerMapper } from "./types.ts";

/**
 * Create a {@linkcode HandlerMapper} that calls a list of mappers in turn until one returns a request handler.
 *
 * @param mapper the array of `HandlerMapper` functions to be called
 * @returns a `HandlerMapper`
 */
export function cascadingHandlerMapper(
  ...mappers: HandlerMapper[]
): HandlerMapper {
  return async (routeModule) => {
    for (const mapper of mappers) {
      const handler = await mapper(routeModule);
      if (typeof handler === "function") {
        return handler;
      }
    }
  };
}
