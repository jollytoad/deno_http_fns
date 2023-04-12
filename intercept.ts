import type { Args, CustomHandler, Skip } from "./types.ts";

/**
 * An interceptor may return no value (void) or undefined to indicate no change.
 */
export type PassThru = void | undefined;

export type RequestInterceptor<in A extends Args = Args> = CustomHandler<
  A,
  Request | PassThru
>;
export type ResponseInterceptor<in out R = Response | Skip> = CustomHandler<
  [response: R],
  R | void
>;
export type ErrorInterceptor<in out R = Response | Skip> = (
  request: Request,
  response: R,
  error: unknown,
) => Response | PassThru;

/**
 * Wrap a Request handler with chains of interceptor functions that modify the
 * request or response, and optionally handle any errors.
 *
 * @param handler the original handler
 * @param pre a chain of RequestInterceptors functions that may return a
 *  new/modified Request that is passed to the handler
 * @param post a chain of ResponseInterceptors functions that may modify the
 *  Response from the handler
 * @param error a chain of ResponseInterceptors that may modify the Response from the handler
 * @returns a new Request handler
 */
export function intercept<A extends Args, R extends Response | Skip>(
  handler: CustomHandler<A, R>,
  pre: RequestInterceptor<A>[] = [],
  post: ResponseInterceptor<R>[] = [],
  error: ErrorInterceptor<R>[] = [],
): typeof handler {
  return async (req, ...args) => {
    let res!: R;

    try {
      for (const interceptor of pre) {
        const result = await interceptor(req, ...args);
        if (result !== undefined) {
          req = result;
        }
      }

      res = await safeHandle(handler, req, ...args);

      for (const interceptor of post) {
        const result = await interceptor(req, res);
        if (result !== undefined) {
          res = result;
        }
      }

      return res;
    } catch (e: unknown) {
      for (const interceptor of error) {
        const result = await interceptor(req, res, e);
        if (result) {
          res = result as R;
        }
      }
      if (res) {
        return res;
      } else {
        throw e;
      }
    }
  };
}

/**
 * Shortcut for `intercept` when you only need to provide ResponseInterceptors.
 *
 * Example: `interceptResponse(..., skip(404))`
 *
 * @param handler the original handler
 * @param interceptors a chain of ResponseInterceptors functions that may modify the
 *  Response from the handler
 * @returns a new Request handler
 */
export function interceptResponse<A extends Args, R extends Response | Skip>(
  handler: CustomHandler<A, R>,
  ...interceptors: ResponseInterceptor<R>[]
): typeof handler {
  return intercept<A, R>(handler, [], interceptors);
}

/**
 * A ResponseInterceptor that will catch and skip any Responses that match the given Statuses.
 */
export function skip(...status: number[]) {
  return (_req: unknown, res: Response | Skip) =>
    res && status.includes(res.status) ? null : undefined;
}

async function safeHandle<A extends Args, R extends Response | null>(
  handler: CustomHandler<A, R>,
  req: Request,
  ...args: A
): Promise<R> {
  try {
    return await handler(req, ...args);
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error as R;
    } else {
      throw error;
    }
  }
}
