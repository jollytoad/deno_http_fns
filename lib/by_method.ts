import { methodNotAllowed } from "./response/method_not_allowed.ts";
import type { Awaitable, MethodHandlers } from "./types.ts";

/**
 * Create a Request handler that delegates based on the HTTP Method of the Request.
 *
 * This will also provide default implementations of HEAD (if GET is declared) and OPTIONS methods.
 *
 * @param handlers an object of handlers, where the key is the HTTP method
 * @param fallback a handler for any method not given, defaults to return a Method Not Allowed response,
 *  but may return `null` if you want the request to cascade to a later handler
 * @returns a Request handler
 */
export function byMethod<A extends unknown[]>(
  handlers: MethodHandlers<A>,
  fallback: (request: Request, ...args: A) => Awaitable<Response | null> = () =>
    methodNotAllowed(),
) {
  const defaultHandlers: typeof handlers = {
    OPTIONS: optionsHandler(handlers),
  };
  if (handlers.GET) {
    defaultHandlers.HEAD = headHandler(handlers.GET);
  }
  return (req: Request, ...args: A) => {
    const method = req.method;
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
  if ("GET" in methods && !("HEAD" in methods)) {
    methods.push("HEAD");
  }
  if (!("OPTIONS" in methods)) {
    methods.push("OPTIONS");
  }
  const allow = methods.join(", ");

  return () => {
    return new Response(null, {
      headers: {
        allow,
      },
    });
  };
}

const headHandler = <A extends unknown[]>(
  handler: (request: Request, ...args: A) => Awaitable<Response | null>,
) =>
async (req: Request, ...args: A) => {
  const response = await handler(req, ...args);
  return response ? new Response(null, response) : response;
};