import type { Awaitable } from "./types.ts";
import { notFound } from "@http/response/not-found";
import { withFallback } from "./with_fallback.ts";
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
export function handle<A extends unknown[]>(
  handlers: Array<(request: Request, ...args: A) => Awaitable<Response | null>>,
  fallback: (request: Request, ...args: A) => Awaitable<Response> = () =>
    notFound(),
): (req: Request, ...args: A) => Awaitable<Response> {
  return withFallback(cascade(...handlers), fallback);
}
