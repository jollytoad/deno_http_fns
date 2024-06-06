import type {
  Awaitable,
  InterceptorKind,
  InterceptorKinds,
  Interceptors,
} from "./types.ts";

/**
 * Wrap a Request handler with chains of interceptor functions that modify the
 * request or response, and optionally handle any errors.
 *
 * @example
 * ```ts
 * Deno.serve(
 *   withFallback(
 *     intercept(
 *
 *       // This is the main handler...
 *       byPattern("/", () => {
 *         return new Response("Hello world");
 *       }),
 *
 *       // The remaining params are the interceptors...
 *
 *       logging(),  // an off-the-self console logger of Request/Response,
 *
 *       cors(),     // adds CORS support for requests
 *
 *       // or add your own custom interceptor...
 *       {
 *         // This is a RequestInterceptor that requires the Request to have an
 *         // Authorization header otherwise responds with a `401 Unauthorized`,
 *         // and asks for credentials.
 *         request: (req) => {
 *           if (!req.headers.has("Authorization")) {
 *             return unauthorized(`Basic realm="Who are you?"`);
 *           }
 *         },
 *       },
 *     ),
 *   ),
 * )
 * ```
 *
 * @param handler the original handler
 * @returns a new Request handler
 */
export function intercept<A extends unknown[], R extends Response | null>(
  handler: (req: Request, ...args: A) => Awaitable<R>,
  ...interceptors: readonly Interceptors<A, R>[]
): typeof handler {
  const hasFinally = interceptors.some((i) => i.finally);

  function* reversedInterceptors() {
    for (let i = interceptors.length - 1; i >= 0; i--) {
      yield interceptors[i]!;
    }
  }

  function* flatten<K extends InterceptorKind>(
    kind: K,
    reverse = false,
  ): Iterable<InterceptorKinds<A, R>[K]> {
    for (
      const { [kind]: i } of reverse ? reversedInterceptors() : interceptors
    ) {
      if (Array.isArray(i)) {
        yield* i;
      } else if (i) {
        yield i as InterceptorKinds<A, R>[K];
      }
    }
  }

  return async (req, ...args) => {
    let res!: R;

    async function applyRequestInterceptors() {
      for (const interceptor of flatten("request")) {
        const result = await interceptor(req, ...args);
        if (result instanceof Request) {
          req = result;
        } else if (result instanceof Response) {
          res = result as R;
          return;
        }
      }
    }

    async function applyResponseInterceptors() {
      for (const interceptor of flatten("response", true)) {
        const result = await interceptor(req, res);
        if (result !== undefined) {
          res = result;
        }
      }
    }

    async function applyErrorInterceptors(e: unknown) {
      for (const interceptor of flatten("error")) {
        const result = await interceptor(req, res, e);
        if (result) {
          res = result as R;
        }
      }
    }

    function applyFinallyInterceptors(reason: unknown) {
      for (const interceptor of flatten("finally", true)) {
        try {
          interceptor(req, res, reason);
        } catch (e: unknown) {
          console.error("Error during finally interceptor", e);
        }
      }
    }

    if (hasFinally) {
      req.signal.addEventListener("abort", function () {
        applyFinallyInterceptors(this.reason);
      }, { once: true });
    }

    try {
      await applyRequestInterceptors();
    } catch (e: unknown) {
      await applyErrorInterceptors(e);
    }

    if (!res) {
      try {
        res = await handler(req, ...args);
      } catch (e: unknown) {
        await applyErrorInterceptors(e);
      }
    }

    try {
      await applyResponseInterceptors();
    } catch (e: unknown) {
      await applyErrorInterceptors(e);
    }

    return res;
  };
}
