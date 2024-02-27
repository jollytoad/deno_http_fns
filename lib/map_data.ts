import type { Awaitable } from "./types.ts";

/**
 * Create a Request handler that maps the incoming Request and first
 * arg to a new arg, then calls the given handler with the original
 * Request and the new argument.
 *
 * Useful for mapping a request with URLPatternResult to template/component properties.
 *
 * @param mapper a function that takes the Request and first arg and returns a new arg
 * @param handler the handler to call with the new arg
 * @returns a Request handler that accepts the new arg type
 */
export function mapData<O, I>(
  mapper: (req: Request, data: I) => O | Promise<O>,
  handler: (req: Request, data: O) => Awaitable<Response | null>,
): (req: Request, data: I) => Promise<Response | null> {
  return async (req, data) => handler(req, await mapper(req, data));
}
