import { methodNotAllowed } from "./response.ts";
import type { Args, CustomHandler } from "./types.ts";
import type { HttpMethod } from "https://deno.land/std@0.193.0/http/method.ts";

export type { HttpMethod };

export type MethodHandlers<A extends Args> = {
  [M in HttpMethod]?: CustomHandler<A>;
};

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
export function byMethod<A extends Args>(
  handlers: MethodHandlers<A>,
  fallback: CustomHandler<A> = () => methodNotAllowed(),
): CustomHandler<A> {
  const defaultHandlers: MethodHandlers<A> = {
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

function optionsHandler<A extends Args>(
  handlers: MethodHandlers<A>,
): CustomHandler<A> {
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

const headHandler =
  <A extends Args>(handler: CustomHandler<A>): CustomHandler<A> =>
  async (req, ...args) => {
    const response = await handler(req, ...args);
    return response ? new Response(null, response) : response;
  };
