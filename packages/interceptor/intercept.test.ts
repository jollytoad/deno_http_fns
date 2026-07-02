import { assertSpyCall, assertSpyCalls, spy } from "@std/testing/mock";
import { intercept } from "./intercept.ts";
import {
  assertInstanceOf,
  assertRejects,
  assertStrictEquals,
} from "@std/assert";

Deno.test("a single request interceptor is called", async () => {
  const interceptorSpy = spy(doNothing);

  const handler = intercept(ok, {
    request: interceptorSpy,
  });

  const res = await handler(request());

  assertSpyCalls(interceptorSpy, 1);

  assertInstanceOf(res, Response);
});

Deno.test("multiple request interceptors are called", async () => {
  const interceptorSpy = spy(doNothing);

  const handler = intercept(ok, {
    request: [
      interceptorSpy,
      interceptorSpy,
    ],
  });

  const res = await handler(request());

  assertSpyCalls(interceptorSpy, 2);

  assertInstanceOf(res, Response);
});

Deno.test("request interceptors from multiple interceptors are called", async () => {
  const interceptorSpy = spy(doNothing);

  const handler = intercept(ok, {
    request: [
      interceptorSpy,
      interceptorSpy,
    ],
  }, {
    request: [
      interceptorSpy,
      interceptorSpy,
    ],
  });

  const res = await handler(request());

  assertSpyCalls(interceptorSpy, 4);

  assertInstanceOf(res, Response);
});

Deno.test("multiple response interceptors are called", async () => {
  const interceptorSpy = spy(doNothing);

  const handler = intercept(ok, {
    response: [
      interceptorSpy,
      interceptorSpy,
    ],
  });

  const res = await handler(request());

  assertSpyCalls(interceptorSpy, 2);

  assertInstanceOf(res, Response);
});

Deno.test("a response returned from a request interceptors causes further request interceptors to be skipped", async () => {
  const interceptorSpy1 = spy(ok);
  const interceptorSpy2 = spy(doNothing);

  const handler = intercept(ok, {
    request: [
      interceptorSpy1,
      interceptorSpy2,
    ],
  });

  const res = await handler(request());

  assertSpyCalls(interceptorSpy1, 1);
  assertSpyCalls(interceptorSpy2, 0);

  assertInstanceOf(res, Response);
});

Deno.test("a response returned from a request interceptors causes the handler to be skipped", async () => {
  const interceptorSpy = spy(ok);
  const handlerSpy = spy(ok);

  const handler = intercept(handlerSpy, {
    request: interceptorSpy,
  });

  const res = await handler(request());

  assertSpyCalls(interceptorSpy, 1);
  assertSpyCalls(handlerSpy, 0);

  assertInstanceOf(res, Response);
});

Deno.test("response interceptors are still called when a request interceptor returns a response", async () => {
  const interceptorSpy1 = spy(ok);
  const interceptorSpy2 = spy(ok);

  const handler = intercept(ok, {
    request: interceptorSpy1,
    response: interceptorSpy2,
  });

  const res = await handler(request());

  assertSpyCalls(interceptorSpy1, 1);
  assertSpyCalls(interceptorSpy2, 1);

  assertInstanceOf(res, Response);
});

Deno.test("error interceptors handle request interceptor errors", async () => {
  const interceptorSpy = spy(throwError);
  const errorResponse = new Response();
  const errorSpy = spy(() => errorResponse);

  const handler = intercept(ok, {
    request: interceptorSpy,
    error: errorSpy,
  });

  const res = await handler(request());

  assertSpyCalls(interceptorSpy, 1);
  assertSpyCalls(errorSpy, 1);

  assertStrictEquals(res, errorResponse);
});

Deno.test("error interceptors handle handler errors", async () => {
  const errorResponse = new Response();
  const errorSpy = spy(() => errorResponse);

  const handler = intercept(throwError as () => null, {
    error: errorSpy,
  });

  const res = await handler(request());

  assertSpyCalls(errorSpy, 1);

  assertStrictEquals(res, errorResponse);
});

Deno.test("error interceptors handle response interceptor errors", async () => {
  const interceptorSpy = spy(throwError);
  const errorResponse = new Response();
  const errorSpy = spy(() => errorResponse);

  const handler = intercept(ok, {
    response: interceptorSpy,
    error: errorSpy,
  });

  const res = await handler(request());

  assertSpyCalls(interceptorSpy, 1);
  assertSpyCalls(errorSpy, 1);

  assertStrictEquals(res, errorResponse);
});

Deno.test("error interceptor response is passed to response interceptors", async () => {
  const interceptorSpy = spy(doNothing);
  const errorResponse = new Response();
  const errorSpy = spy(() => errorResponse);

  const handler = intercept(ok, {
    request: throwError,
    response: interceptorSpy,
    error: errorSpy,
  });

  const initialRequest = request();

  const res = await handler(initialRequest);

  assertSpyCall(errorSpy, 0, { returned: errorResponse });
  assertSpyCall(interceptorSpy, 0, { args: [initialRequest, errorResponse] });

  assertSpyCalls(interceptorSpy, 1);
  assertSpyCalls(errorSpy, 1);

  assertStrictEquals(res, errorResponse);
});

Deno.test("error is thrown if not handled by an error interceptor", async () => {
  const errorSpy = spy(doNothing);

  const handler = intercept(ok, {
    request: throwError,
    error: errorSpy,
  });

  const initialRequest = request();

  await assertRejects(async () => {
    await handler(initialRequest);
  });

  assertSpyCalls(errorSpy, 1);
});

Deno.test("error is not thrown if handled by an error interceptor", async () => {
  const errorResponse = new Response();
  const errorSpy = spy(() => errorResponse);

  const handler = intercept(ok, {
    request: throwError,
    error: errorSpy,
  });

  const initialRequest = request();

  const res = await handler(initialRequest);

  assertSpyCalls(errorSpy, 1);

  assertStrictEquals(res, errorResponse);
});

Deno.test("around interceptors", async () => {
  const middlewareSpy1 = spy(middleware);
  const middlewareSpy2 = spy(middleware);
  const okSpy = spy(ok);

  const handler = intercept(okSpy, {
    around: [middlewareSpy1, middlewareSpy2],
  });

  const res = await handler(request());

  assertSpyCalls(middlewareSpy1, 1);
  assertSpyCalls(middlewareSpy2, 1);
  assertSpyCalls(okSpy, 1);

  assertInstanceOf(res, Response);
});

// TODO: test modifying & replacing the Request
// TODO: test modifying & replacing the Response

function finallyNoop(_req: Request, _res: Response | null, _reason?: unknown) {
  // shape matches the FinallyInterceptor signature
}

Deno.test("finally interceptor fires once on success with no body", async () => {
  const finallySpy = spy(finallyNoop);

  const handler = intercept(ok, {
    finally: finallySpy,
  });

  const res = await handler(request());

  assertInstanceOf(res, Response);
  assertSpyCalls(finallySpy, 1);
  // On success the reason is undefined (per the new contract).
  assertStrictEquals(finallySpy.calls[0]!.args[2], undefined);
});

Deno.test("finally interceptor fires once on success with a body that is drained", async () => {
  const finallySpy = spy(finallyNoop);

  const handler = intercept(
    () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new Uint8Array([104, 105])); // "hi"
            controller.close();
          },
        }),
      ),
    { finally: finallySpy },
  );

  const res = await handler(request());
  // Drain the body to trigger the body-drained path.
  await res.text();

  assertSpyCalls(finallySpy, 1);
  assertStrictEquals(finallySpy.calls[0]!.args[2], undefined);
});

Deno.test("finally interceptor fires once on signal abort with the reason", async () => {
  const finallySpy = spy(finallyNoop);
  const controller = new AbortController();
  const req = new Request("http://example.com", { signal: controller.signal });

  // Handler never reads the body, so the body-drained path will not fire.
  const handler = intercept(ok, { finally: finallySpy });

  // Kick off the handler, then abort.
  const promise = handler(req);
  controller.abort("client-gave-up");

  // The handler may resolve to a Response, or may reject — both are
  // acceptable outcomes once the signal is aborted. What matters is
  // that `finally` was invoked exactly once, with the abort reason.
  try {
    await promise;
  } catch {
    // ignored
  }

  assertSpyCalls(finallySpy, 1);
  assertStrictEquals(finallySpy.calls[0]!.args[2], "client-gave-up");
});

Deno.test("finally interceptor fires exactly once when both paths could fire", async () => {
  const finallySpy = spy(finallyNoop);

  const handler = intercept(
    () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new Uint8Array([104, 105]));
            controller.close();
          },
        }),
      ),
    { finally: finallySpy },
  );

  const controller = new AbortController();
  const req = new Request("http://example.com", { signal: controller.signal });
  const promise = handler(req);

  // Abort and drain the body in the same tick — both paths race.
  controller.abort("race");
  const res = await promise;
  try {
    await res!.text();
  } catch {
    // may throw if aborted before body is read
  }

  assertSpyCalls(finallySpy, 1);
});

Deno.test("finally interceptor fires via a Deno-style info.completed provider in args[0]", async () => {
  const finallySpy = spy(finallyNoop);

  let resolveCompleted!: () => void;
  const info = {
    completed: new Promise<void>((r) => {
      resolveCompleted = r;
    }),
  };
  const handler = intercept(okWithArgs, { finally: finallySpy });

  const res = await handler(request(), info);

  // Finally must not have fired yet — the provider has not resolved.
  assertSpyCalls(finallySpy, 0);
  assertInstanceOf(res, Response);

  // Resolve the provider, then yield to the microtask queue.
  resolveCompleted();
  await Promise.resolve();
  await Promise.resolve();

  assertSpyCalls(finallySpy, 1);
  assertStrictEquals(finallySpy.calls[0]!.args[2], undefined);
});

Deno.test("finally interceptor fires via a withCompletion-style provider in a later arg", async () => {
  const finallySpy = spy(finallyNoop);

  let resolveCompleted!: () => void;
  const provider = {
    completed: new Promise<void>((r) => {
      resolveCompleted = r;
    }),
  };
  // Mimic a host wrapper that places the provider as the 2nd arg.
  const handler = intercept(okWithArgs, { finally: finallySpy });

  const res = await handler(request(), { unrelated: 1 }, provider);

  assertSpyCalls(finallySpy, 0);
  assertInstanceOf(res, Response);

  resolveCompleted();
  await Promise.resolve();
  await Promise.resolve();

  assertSpyCalls(finallySpy, 1);
});

Deno.test("finally interceptor fires for a null response when a provider is present", async () => {
  const finallySpy = spy(finallyNoop);

  let resolveCompleted!: () => void;
  const info = {
    completed: new Promise<void>((r) => {
      resolveCompleted = r;
    }),
  };
  // R allows null here.
  const handler = intercept(
    (_req: Request, ..._args: unknown[]) => null,
    { finally: finallySpy },
  );

  const res = await handler(request(), info);

  // Null responses must not fire finally until the provider resolves.
  assertSpyCalls(finallySpy, 0);
  assertStrictEquals(res, null);

  resolveCompleted();
  await Promise.resolve();
  await Promise.resolve();

  assertSpyCalls(finallySpy, 1);
});

Deno.test("finally interceptor fires exactly once when both provider and req.signal abort fire", async () => {
  const finallySpy = spy(finallyNoop);

  let resolveCompleted!: () => void;
  const info = {
    completed: new Promise<void>((r) => {
      resolveCompleted = r;
    }),
  };
  const controller = new AbortController();
  const req = new Request("http://example.com", { signal: controller.signal });
  const handler = intercept(okWithArgs, { finally: finallySpy });

  const promise = handler(req, info);
  // Resolve the provider and abort the signal in the same tick.
  resolveCompleted();
  controller.abort("race");
  try {
    await promise;
  } catch {
    // ignored
  }

  assertSpyCalls(finallySpy, 1);
});

function request() {
  return new Request("http://example.com");
}

function ok() {
  return new Response();
}

function okWithArgs(..._args: unknown[]) {
  return new Response();
}

function doNothing() {}

function throwError() {
  throw Error("Something bad happened");
}

function middleware(_req: Request, next: () => void) {
  return next();
}
