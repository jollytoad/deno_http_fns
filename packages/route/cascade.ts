import type { Awaitable } from "./types.ts";

/**
 * Create a Request handler that calls a list of handlers in turn until one returns a Response.
 *
 * @param handlers the array of handler functions to be called
 * @template A the additional arguments passed to the handler
 * @template R the Response or an alternative response type
 * @returns a Request handler that returns a Response or null
 *
 * @example
 * ```ts
 * Deno.serve(withFallback(
 *   cascade(
 *     byPattern("/hello", () => {
 *       return new Response("Hello world");
 *     }),
 *     byPattern("/more/:path*", (_req, match) => {
 *       return new Response(`You want more at ${match.pathname.groups.path}`);
 *     }),
 *   ),
 * ));
 * ```
 */
export function cascade<A extends unknown[], R = Response>(
  ...handlers: Array<
    (request: Request, ...args: A) => Awaitable<R | null>
  >
): (req: Request, ...args: A) => Promise<R | null> {
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
