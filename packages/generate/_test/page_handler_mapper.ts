import type { RequestHandler, RouteModule } from "@http/generate/types";
import { pageHandler } from "$test/generate/page_handler.ts";

/**
 * An example `HandlerMapper` that will take a route module with an exported
 * `body` function (which is expected to return html content) and wrap in a
 * function that decorates this with a surrounding html page markup.
 */
export function pageHandlerMapper(
  { loaded }: RouteModule,
): RequestHandler | undefined {
  if (hasBodyFunction(loaded)) {
    return pageHandler(loaded.body);
  }
}

/**
 * Check whether there is a `body()` function 
 */
export function hasBodyFunction(
  loaded: Record<string, unknown>,
): loaded is { body: () => string } {
  return "body" in loaded && typeof loaded.body === "function";
}

export default pageHandlerMapper;
