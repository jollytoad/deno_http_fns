import { methodNotAllowed } from "@http/response/method-not-allowed";
import { noContent } from "@http/response/no-content";
import { replaceBody } from "@http/response/replace-body";
import type { Awaitable, HttpMethod, MethodHandlers } from "./types.ts";

/**
 * Create a Request handler that delegates based on the HTTP Method of the Request.
 *
 * This will also provide default implementations of HEAD (if GET is declared) and OPTIONS methods.
 *
 * @param handlers an object of handlers, where the key is the HTTP method
 * @param fallback a handler for any method not given, defaults to return a Method Not Allowed response,
 *  but may return `null` if you want the request to cascade to a later handler
 * @returns a Request handler
 *
 * @example Usage with `Deno.serve`, `byPattern` and `handle`
 * ```ts
 * Deno.serve(handle([
 *   byPattern(
 *     "/:path*",
 *     byMethod({
 *       GET: (_req, match) => {
 *         return new Response(`GET from ${match.pathname.groups.path}`);
 *       },
 *       PUT: (_req, match) => {
 *         return new Response(`PUT to ${match.pathname.groups.path}`);
 *       }
 *     })
 *  ),
 * ]));
 * ```
 */
export function byMethod<A extends unknown[]>(
  handlers: MethodHandlers<A>,
  fallback: (request: Request, ...args: A) => Awaitable<Response | null> = () =>
    methodNotAllowed(),
): (req: Request, ...args: A) => Awaitable<Response | null> {
  const defaultHandlers: typeof handlers = {
    OPTIONS: optionsHandler(handlers),
  };
  if (handlers.GET) {
    defaultHandlers.HEAD = headHandler(handlers.GET);
  }
  return (req, ...args) => {
    const method = req.method as HttpMethod;
    const handler = handlers[method] ?? defaultHandlers[method];

    if (handler) {
      return handler(req, ...args);
    }

    return fallback(req, ...args);
  };
}

function optionsHandler<A extends unknown[]>(
  handlers: MethodHandlers<A>,
) {
  const methods = Object.keys(handlers);
  if ("GET" in handlers && !("HEAD" in handlers)) {
    methods.push("HEAD");
  }
  if (!("OPTIONS" in handlers)) {
    methods.push("OPTIONS");
  }
  const allow = methods.join(", ");

  return () => noContent({ allow });
}

const headHandler = <A extends unknown[]>(
  handler: (request: Request, ...args: A) => Awaitable<Response | null>,
) =>
async (req: Request, ...args: A) => {
  const response = await handler(req, ...args);
  return response ? replaceBody(response, null) : response;
};
