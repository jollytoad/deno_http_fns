import type { Args, CustomHandler } from "./types.ts";
import { notFound } from "./response.ts";
import { withFallback } from "./fallback.ts";
import { cascade } from "./cascade.ts";

/**
 * Create a Request handler that tries each handler and then a fallback as a last resort.
 *
 * This is just a combination of `cascade` and `withFallback` for convenience for creating
 * your top-level handler.
 *
 * @param handlers the array of handler functions to be called in turn until one returns a Response
 * @param fallback the handler called if none of the handlers above returns a Response,
 *  this optional and defaults to a Not Found response.
 * @returns a Request handler that always returns a Response
 */
export function handle<A extends Args>(
  handlers: CustomHandler<A>[],
  fallback: CustomHandler<A, Response> = () => notFound(),
): CustomHandler<A, Response> {
  return withFallback(cascade(...handlers), fallback);
}
