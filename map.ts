import type { CustomHandler } from "./types.ts";

/**
 * Create a Request handler that maps the incoming Request and first
 * arg to a new arg, then calls the given handler with the original
 * Request and the new argument.
 *
 * Useful for mapping a request with URLPatternResult to template/component properties.
 *
 * @param mapper a function that takes the Request and first arg and returns a new arg
 * @param handler the handler to call with the new arg
 * @returns a Request handler that accepts the new arg type
 */
export const mapData = <O, I>(
  mapper: (req: Request, data: I) => O | Promise<O>,
  handler: CustomHandler<[O]>,
): CustomHandler<[I]> =>
async (req, data) => handler(req, await mapper(req, data));
