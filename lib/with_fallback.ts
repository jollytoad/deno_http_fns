import type { Awaitable } from "./types.ts";
import { notFound } from "./response/not_found.ts";

/**
 * Create a Request handler that guarantees a Response, by calling a fallback handler
 * if the given handler skips.
 *
 * Usually used to wrap the top level handler, so that a Not Found is returned once all routes
 * have been exhausted.
 *
 * @param handler the handler to call first, which may or may not return a Response
 * @param fallback the handler called if the above handle doesn't return a Response,
 *  this optional and defaults to a Not Found response
 * @returns a Request handler that always returns a Response
 */
export function withFallback<A extends unknown[]>(
  handler: (request: Request, ...args: A) => Awaitable<Response | null>,
  fallback: (request: Request, ...args: A) => Awaitable<Response> = () =>
    notFound(),
) {
  return async (req: Request, ...args: A) => {
    const res = await handler(req, ...args);
    if (res) {
      return res;
    }

    return fallback(req, ...args);
  };
}
