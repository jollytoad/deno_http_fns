/**
 * An interceptor to store the Request in an async context to make it available
 * throughout the handling of the request without having to explicitly pass it
 * through function parameters.
 *
 * @example
 * ```ts
 * Deno.serve(intercept(handler, requestContext()));
 * ```
 *
 * or
 *
 * @example
 * ```ts
 * Deno.serve(intercept(handler, { around: storeRequest }));
 * ```
 *
 * Further with the request chain you can then obtain the request:
 * @example
 * ```ts
 * const req = getRequest();
 * ```
 *
 * @module
 */

import { AsyncLocalStorage } from "node:async_hooks";
import type { Awaitable, Interceptors } from "./types.ts";

let requestStorage: AsyncLocalStorage<Request> | undefined = undefined;

/**
 * 'Around' interceptor that stores the Request in an async context.
 *
 * Currently uses the Node.js AsyncLocalStore API.
 *
 * @example
 * ```ts
 * Deno.serve(intercept(handler, { around: storeRequest }));
 * ```
 */
export function storeRequest(
  req: Request,
  next: () => Awaitable<void>,
): Awaitable<void> {
  requestStorage ??= new AsyncLocalStorage<Request>();
  return requestStorage.run(req, next);
}

/**
 * Get the current Request, as stored by `storeRequest`.
 *
 * @example
 * ```ts
 * const req = getRequest();
 * ```
 *
 * @throws if no Request is found
 */
export function getRequest(): Request {
  const req = requestStorage?.getStore();
  if (!req) {
    throw new Error(
      `No Request found, use the storeRequest 'around' interceptor`,
    );
  }
  return req;
}

/**
 * Register the `storeRequest` interceptor
 *
 * @example
 * ```ts
 * Deno.serve(intercept(handler, requestContext()));
 * ```
 */
export function requestContext<R extends Response | null>(): Interceptors<
  unknown[],
  R
> {
  return {
    around: storeRequest,
  };
}
