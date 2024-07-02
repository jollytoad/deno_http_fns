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

// TODO: test modifying & replacing the Request
// TODO: test modifying & replacing the Response
// TODO: test finally handling

function request() {
  return new Request("http://example.com");
}

function ok() {
  return new Response();
}

function doNothing() {}

function throwError() {
  throw Error("Something bad happened");
}
