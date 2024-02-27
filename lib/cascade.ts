import type { Awaitable } from "./types.ts";

/**
 * Create a Request handler that calls a list of handlers in turn until one returns a Response.
 *
 * @param handlers the array of handler functions to be called
 * @returns a Request handler that returns a Response or null
 */
export function cascade<A extends unknown[]>(
  ...handlers: Array<
    (request: Request, ...args: A) => Awaitable<Response | null>
  >
): (req: Request, ...args: A) => Promise<Response | null> {
  return async (req, ...args) => {
    for (const handler of handlers) {
      const res = await handler(req, ...args);
      if (res) {
        return res;
      }
    }

    return null;
  };
}
