import type { Args, CustomHandler } from "./types.ts";
import { notFound } from "./response.ts";

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
export function withFallback<A extends Args>(
  handler: CustomHandler<A>,
  fallback: CustomHandler<A, Response> = () => notFound(),
): CustomHandler<A, Response> {
  return async (req, ...args) => {
    const res = await handler(req, ...args);
    if (res) {
      return res;
    }

    return fallback(req, ...args);
  };
}
