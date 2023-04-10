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
    | string,
): CustomHandler<A> {
  let handler: CustomHandler<A> | undefined | null = undefined;

  return async (req, ...args) => {
    if (handler === undefined) {
      const loaded = typeof handlerLoader === "string"
        ? await import(handlerLoader)
        : typeof handlerLoader === "function"
        ? await handlerLoader()
        : undefined;

      if (typeof loaded === "function") {
        handler = loaded;
      } else if (typeof loaded?.default === "function") {
        handler = loaded.default;
      } else {
        console.error("Unable to lazily load handler:", handlerLoader);
        handler = null;
      }
    }

    if (typeof handler === "function") {
      return handler(req, ...args);
    }

    return null;
  };
}
