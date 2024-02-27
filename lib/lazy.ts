import type { Awaitable } from "./types.ts";

/**
 * Create a handler that lazily loads a handler fn only when required.
 *
 * @param handlerLoader function to load the handler fn, or a module or
 *  module specifier that exports the handler as the default export.
 */
export function lazy<
  A extends unknown[],
  H = (req: Request, ...args: A) => Awaitable<Response | null>,
>(
  handlerLoader:
    | (() => Awaitable<H | { default: H }>)
    | string
    | URL,
): (req: Request, ...args: A) => Promise<Response | null> {
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
    const loaded = typeof handlerLoader === "string"
      ? await import(handlerLoader)
      : handlerLoader instanceof URL
      ? await import(handlerLoader.href)
      : typeof handlerLoader === "function"
      ? await handlerLoader()
      : undefined;

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
