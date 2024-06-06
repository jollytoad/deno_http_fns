# Request/Response Interceptors

_Similar to middleware, but more outerwear._

## What is Middleware?

Middleware in most HTTP routers is form of
[aspect-oriented programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming),
but it's generally limited to the _around_ advice. A middleware function is
given a `next()` function, that calls the next middleware or eventually the
request handler itself, but it may perform any logic it wants _around_ this
call.

## What are Interceptors?

Interceptors also take a leaf out of AOP, but instead let you define _before_
and _after_ advice.

Specifically:

- _before_ the request handler - allowing interception of the
  [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request), and
- _after_ the handler - allowing interception of the
  [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)

Interceptors are registered using the `intercept()` function that wraps the
handler, which is given the set of interceptors, returning a new handler
function with all the interception baked in.

Here's an example of a Request Interceptor that ensures an
[`Authorization`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)
header is present...

```ts
Deno.serve(
  withFallback(
    intercept(
      // This is the main handler...
      () => new Response("Hello world"),
      {
        // This is a RequestInterceptor that requires the Request to have an
        // Authorization header otherwise responds with a `401 Unauthorized`,
        // and asks for credentials.
        request: (req) => {
          if (!req.headers.has("Authorization")) {
            return unauthorized(`Basic realm="Who are you?"`);
          }
        },
      },
    ),
  ),
);
```

## Off the Shelf Interceptors

This package contains a number of pre-built interceptors...

- [catchResponse](https://jsr.io/@http/interceptor/doc/catch-response/~/catchResponse) -
  an error interceptor that catches any thrown Responses and return it as the
  actual Response
- [cors](https://jsr.io/@http/interceptor/doc/cors/~/cors) - interceptors to
  handle CORS (Cross-Origin Resource Sharing) requests
- [logging](https://jsr.io/@http/interceptor/doc/logger/~/logging) -
  interceptors to log Request info and Response status to the console
- [skip](https://jsr.io/@http/interceptor/doc/skip/~/skip) - intercept Responses
  by status and convert to a 'skipped' (`null`) response, so that the request
  can then be delegated to another handler
- [verifyHeader](https://jsr.io/@http/interceptor/doc/verify-header/~/verifyHeader) -
  verify that a Request header matches an expected value

and also some utilities to wrap interceptors to change behaviour...

- [whenStatus](https://jsr.io/@http/interceptor/doc/when-status/~/whenStatus) -
  apply an interceptor only for specific response statuses
- [whenPattern](https://jsr.io/@http/interceptor/doc/when-pattern/~/whenPattern) -
  apply an interceptor only when the request URL matches a given pattern

These are in a similar vein to the `by*` functions of
[@http/route](https://jsr.io/@http/route), the naming convention of `when*` is
used to distinguish these interceptor functions from the routing functions.

## Types of Interceptor

The [`intercept()`](https://jsr.io/@http/interceptor/doc/intercept/~/intercept)
function supports registration of four different
[types of interceptor](https://jsr.io/@http/interceptor/doc/types/~/InterceptorKinds):

- [`request`](https://jsr.io/@http/interceptor/doc/types/~/InterceptorKinds.request)
- [`response`](https://jsr.io/@http/interceptor/doc/types/~/InterceptorKinds.response)
- [`error`](https://jsr.io/@http/interceptor/doc/types/~/InterceptorKinds.error)
- [`finally`](https://jsr.io/@http/interceptor/doc/types/~/InterceptorKinds.finally)

These maybe supplied as the keys of an object, and you may supply a single
function or and array of functions for each type. You may also supply either a
single object or an array of these objects to the `intercept` function.

`request` and `error` interceptors are invoked in the order in which they are
supplied, whereas `response` and `finally` are applied in reverse order. This
ensures that a top-level feature that provides multiple types of interceptor
(such as a logger) would be the first to intercept the `Request`, and the last
to intercept the `Response`.

### [Request Interceptor](https://jsr.io/@http/interceptor/doc/types/~/RequestInterceptor)

These are called before the `Request` is passed to the actual handler, and may
be used to modify or block requests entirely before they get to the handler.

The Request Interceptor is a function, that accepts the incoming `Request`, and
any additional arguments passed to the handler that is created by `intercept`.

It may return one of the following:

- Nothing (`undefined`/`void`) - to indicate no action is to be taken, the
  original `Request` is free to pass to the next interceptor or to the handler
  (you may also just return the original Request)
- A new or modified `Request` - to replace the incoming request, to pass to the
  next interceptor or the handler
- A `Response` - to skip any further Request interceptors and the handler, this
  would pass to further Response interceptors though
- `null` (if allowed) - indicate that this handler as a whole cannot handle the
  request, this is used in combination with
  [`cascade`](https://jsr.io/@http/route/doc/cascade/~/cascade) and
  [`withFallback`](https://jsr.io/@http/route/doc/with-fallback/~/withFallback)
  functions of [@http/route] - but use of `null` and those functions is entirely
  optional.

The return value can optionally be wrapped in a `Promise`.

It may also throw an error, to be handled by the Error Interceptors.

So in our example above, we check the header and either return nothing, or an
unauthorized `Response`.

### [Response Interceptor](https://jsr.io/@http/interceptor/doc/types/~/ResponseInterceptor)

These are called with the outgoing `Response`, after the handler, or an
interceptor that returned a `Response`.

This is can be used, for example, to test whether something like a Not Modified
response should be sent instead, or to render a full page for an error or a Not
Found, or to add CORS or other custom headers.

Again, this just another function, that accepts the `Request` received by the
handler (or interceptor), and the `Response` returned from it.

It may return one of the following:

- Nothing (`undefined`/`void`) - to indicate no action is to be taken, and the
  original `Response` should be passed on
- A new or modified `Response` - to replace the outgoing request, to pass to the
  next interceptor or eventually out from the server
- `null` (if allowed) - indicate that this handler as a whole cannot handle the
  request, this is used in combination with `cascade` and `withFallback`
  functions - but use of `null` and those functions is entirely optional.

The return value can optionally be wrapped in a `Promise`.

It may also throw an error, to be handled by the Error Interceptors.

### [Error Interceptor](https://jsr.io/@http/interceptor/doc/types/~/ErrorInterceptor)

These are called if a Request or Response interceptor, or the handler throws an
error. They can be used to provide a reasonable Response, and/or log the error.

An Error Interceptor function accepts the `Request`, optionally a `Response` (if
one has been produced so far), and the error (or other object) that was caught.

It may return one of the following:

- Nothing (`undefined`/`void`) - if it is unable to handle the error
- A `Response` - to become the new outgoing `Response`, this will be passed to
  further Error Interceptors, and may still be passed to Response Interceptors
  if the throw occurred from a Request Interceptor or the handler.

The return value can optionally be wrapped in a `Promise`.

If an Error Interceptor throws an error, it will NOT be handled by any other
interceptors and will immediately propagate out from the handler created by
`intercept()`.

### [Finally Interceptor](https://jsr.io/@http/interceptor/doc/types/~/FinallyInterceptor)

These are called when a Response has completed or been aborted, and after all
data from it's body has been drained.

This is useful for logging, recording metrics, and cleaning up resources after a
request.

The interceptor function accepts the `Request`, optionally a `Response` (if one
was created before being aborted), and optionally the reason for the abort (from
the dispatched `abort` event).

It should not return anything, but anything that is returned is ignored. These
interceptors are not `await`ed.

It should not throw any errors, but any errors thrown are simply caught and
logged to the console, and any further interceptors will continue to be called.

## Shortcuts

### [`interceptResponse()`](https://jsr.io/@http/interceptor/doc/intercept-response/~/interceptResponse)

Use of just Response Interceptors is the most common pattern, and so there is a
shortcut to `intercept()` for just those.

This example looks for static files first using the
[staticRoute](https://jsr.io/@http/route-deno/doc/static-route/~/staticRoute),
which results in a 404 response if the file is not found. So we use the
[skip](https://jsr.io/@http/interceptor/doc/skip/~/skip) interceptor to convert
any 404 response to a `null` (unhandled) response, the request can then be
delegated to later handlers supplied to the
[handle](https://jsr.io/@http/route/doc/handle/~/handle) function...

```ts
Deno.serve(
  handle([
    interceptResponse(
      staticRoute("/", import.meta.resolve("./public")),
      skip(404),
    ),
    byPattern("/hello", () => new Response("Hello")),
  ]),
);
```
