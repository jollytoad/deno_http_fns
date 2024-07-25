/**
 * A result that may be `await`ed.
 */
export type Awaitable<T> = T | Promise<T>;

/**
 * A minimal definition of the Cloudflare Worker handler export.
 */
export interface ExportedHandler<E extends Env> {
  fetch: (
    request: Request,
    env: E,
    ctx: ExecutionContext,
  ) => Awaitable<Response>;
}

/**
 * Base type for a Cloudflare env, second parameter of the request handler.
 */
export type Env = Record<string, unknown>;

/**
 * Third parameter of the Cloudflare request handler.
 */
export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

/**
 * Additional args passed into the Cloudflare handler following the Request.
 */
export type HandlerArgs<E extends Env = Env> = [
  env: E,
  ctx: ExecutionContext,
];
