import type { Awaitable, ResponseInterceptor } from "./types.ts";
import { intercept } from "./intercept.ts";

/**
 * Shortcut for `intercept` when you only need to provide ResponseInterceptors.
 *
 * Example: `interceptResponse(..., skip(404))`
 *
 * @param handler the original handler
 * @param interceptors a chain of ResponseInterceptor functions that may modify the
 *  Response from the handler
 * @returns a new Request handler
 */
export function interceptResponse<
  A extends unknown[],
  R extends Response | null,
>(
  handler: (req: Request, ...args: A) => Awaitable<R>,
  ...interceptors: ResponseInterceptor<R>[]
): typeof handler {
  return intercept<A, R>(handler, { response: interceptors });
}
