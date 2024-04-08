import type { Awaitable } from "@http/handler/types";
import type { Interceptors, ResponseInterceptor } from "./types.ts";

/**
 * Wrap a Request handler with chains of interceptor functions that modify the
 * request or response, and optionally handle any errors.
 *
 * @param handler the original handler
 * @returns a new Request handler
 */
export function intercept<A extends unknown[], R extends Response | null>(
  handler: (req: Request, ...args: A) => Awaitable<R>,
  ...interceptors: readonly Interceptors<A, R>[]
): typeof handler {
  const reverseInterceptors = [...interceptors].reverse();

  return async (req, ...args) => {
    let res!: R;

    try {
      try {
        for (const { request } of interceptors) {
          for (const interceptor of request ?? []) {
            const result = await interceptor(req, ...args);
            if (result instanceof Request) {
              req = result;
            } else if (result instanceof Response) {
              throw result;
            }
          }
        }
      } catch (e: unknown) {
        if (e instanceof Response) {
          res = e as R;
        } else {
          throw e;
        }
      }

      if (!res) {
        res = await safeHandle(handler, req, ...args);
      }

      for (const { response } of reverseInterceptors) {
        for (const interceptor of response ?? []) {
          const result = await interceptor(req, res);
          if (result !== undefined) {
            res = result;
          }
        }
      }

      return res;
    } catch (e: unknown) {
      for (const { error } of interceptors) {
        for (const interceptor of error ?? []) {
          const result = interceptor(req, res, e);
          if (result) {
            res = result as R;
          }
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
 * @param interceptors a chain of ResponseInterceptor functions that may modify the
 *  Response from the handler
 * @returns a new Request handler
 */
export function interceptResponse<
  A extends unknown[],
  R extends Response | null,
>(
  handler: (req: Request, ...args: A) => Awaitable<R>,
  ...interceptors: ResponseInterceptor<R>[]
): typeof handler {
  return intercept<A, R>(handler, { response: interceptors });
}

/**
 * A ResponseInterceptor that will catch and skip any Responses that match the given Statuses.
 */
export function skip(
  ...status: number[]
): (req: Request, res: Response | null) => null | undefined {
  return (_req, res) => res && status.includes(res.status) ? null : undefined;
}

async function safeHandle<A extends unknown[], R extends Response | null>(
  handler: (req: Request, ...args: A) => Awaitable<R>,
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
