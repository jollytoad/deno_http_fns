/**
 * A result that may be `await`ed.
 */
export type Awaitable<T> = T | Promise<T>;

/**
 * A handler that may return a null to indicate it cannot handle the request.
 */
export type OptionalHandler<A extends unknown[]> = (
  req: Request,
  ...args: A
) => Awaitable<Response | null>;

/**
 * A handler that will always return a Response.
 */
export type ConcreteHandler<A extends unknown[]> = (
  req: Request,
  ...args: A
) => Awaitable<Response>;
