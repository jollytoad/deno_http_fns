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
    let unhandledError: unknown | undefined;
    let finallyApplied = false;

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

    async function applyErrorInterceptors(error: unknown) {
      for (const interceptor of flatten("error")) {
        try {
          const result = await interceptor(req, res, error);
          if (result !== undefined) {
            res = result as R;
          }
        } catch (error2: unknown) {
          console.error("Error during error interceptor", error2);
          unhandledError = error2;
          return;
        }
      }
      if (res === undefined) {
        console.error("Error not handled by interceptor", error);
        unhandledError = error;
      }
    }

    function applyFinallyInterceptors(reason?: unknown) {
      if (finallyApplied) return;
      finallyApplied = true;

      for (const interceptor of flatten("finally", true)) {
        try {
          interceptor(req, res, reason);
        } catch (error: unknown) {
          console.error("Error during finally interceptor", error);
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
    } catch (error: unknown) {
      await applyErrorInterceptors(error);
    }

    if (!res) {
      const iterator = flatten("around")[Symbol.iterator]();
      const next = async () => {
        const result = iterator.next();

        if (result.done) {
          res = await handler(req, ...args);
        } else {
          return await result.value(req, next, ...args);
        }
      };
      try {
        await next();
      } catch (error: unknown) {
        await applyErrorInterceptors(error);
      }
    }

    if (!unhandledError) {
      try {
        await applyResponseInterceptors();
      } catch (error: unknown) {
        await applyErrorInterceptors(error);
      }
    }

    if (hasFinally) {
      // Look for a host/runtime-supplied completed promise provider in the args
      // (e.g. Deno's `info.completed`, or a `{ completed }` injected by
      // some other wrapper).
      // When present, it is preferred over the onResponseComplete tap.
      const completed = args.findLast(hasCompleted)?.completed;

      if (res) {
        if (completed) {
          completed.then(() => applyFinallyInterceptors());
        } else {
          // No provider available — fall back to observing the response body.
          const { onResponseComplete } = await import(
            "@http/response/on-response-complete"
          );
          res = onResponseComplete(res, applyFinallyInterceptors) as R;
        }
      } else {
        // Handler declined (returned null) — fire on completion (or microtask).
        (completed ?? Promise.resolve()).then(() => applyFinallyInterceptors());
      }
    }

    if (unhandledError) {
      throw unhandledError;
    }

    return res;
  };
}

function hasCompleted(v: unknown): v is { completed: PromiseLike<unknown> } {
  return !!v && typeof v === "object" && "completed" in v &&
    isPromiseLike(v.completed);
}

function isPromiseLike(v: unknown): v is PromiseLike<unknown> {
  return !!v && typeof v === "object" && "then" in v &&
    typeof v.then === "function";
}
