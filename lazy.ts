import { Args, CustomHandler } from "./types.ts";

/**
 * Create a handler that lazily loads a handler fn only when required.
 *
 * @param handlerLoader function to load the handler fn, or a module or
 *  module specifier that exports the handler as the default export.
 */
export function lazy<A extends Args>(
  handlerLoader:
    | (() => Promise<CustomHandler<A> | { default: CustomHandler<A> }>)
    | string
    | URL,
): CustomHandler<A> {
  let handlerPromise: Promise<CustomHandler<A> | null> | undefined = undefined;
  let handler: CustomHandler<A> | null | undefined = undefined;

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
