/**
 * A result that may be `await`ed.
 */
export type Awaitable<T> = T | Promise<T>;
