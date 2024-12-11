import type { Awaitable } from "./types.ts";

/**
 * Create a handler that lazily loads a handler fn only when required.
 *
 * @param handlerLoader function to load the handler fn, or a module or
 *  module specifier that exports the handler as the default export.
 * @param transformer an optional function that can transform the loaded
 *  module before returning it.
 * @template A the additional arguments passed to the handler
 * @template R the Response or an alternative response type
 * @template H the handler function signature
 */
export function lazy<
  A extends unknown[],
  H = (req: Request, ...args: A) => Awaitable<Response | null>,
>(
  handlerLoader:
    | (() => Awaitable<H | { default: H }>)
    | string
    | URL,
  transformer?: (handlerOrModule: unknown) => Awaitable<unknown>,
): (req: Request, ...args: A) => Promise<Response | null>;
export function lazy<
  A extends unknown[],
  R = Response,
  H = (req: Request, ...args: A) => Awaitable<R | null>,
>(
  handlerLoader:
    | (() => Awaitable<H | { default: H }>)
    | string
    | URL,
  transformer?: (handlerOrModule: unknown) => Awaitable<unknown>,
): (req: Request, ...args: A) => Promise<R | null> {
  let handlerPromise: Promise<H | null> | undefined = undefined;
  let handler: H | null | undefined = undefined;

  return async (req, ...args) => {
    if (handler === undefined && handlerPromise === undefined) {
      handlerPromise = init();
    }

    if (handler === undefined) {
      handler = await handlerPromise;
      handlerPromise = undefined;
    }

    if (typeof handler === "function") {
      return handler(req, ...args);
    }

    return null;
  };

  async function init() {
    let loaded = typeof handlerLoader === "string"
      ? await import(handlerLoader)
      : handlerLoader instanceof URL
      ? await import(handlerLoader.href)
      : typeof handlerLoader === "function"
      ? await handlerLoader()
      : undefined;

    if (transformer) {
      loaded = await transformer(loaded);
    }

    if (typeof loaded === "function") {
      return loaded;
    } else if (typeof loaded?.default === "function") {
      return loaded.default;
    } else {
      console.error("Unable to lazily load handler:", handlerLoader);
      return null;
    }
  }
}
