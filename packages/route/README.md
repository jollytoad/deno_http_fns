# HTTP Routing functions

This is a collection of composable functions to build a HTTP router as a
standard [Request] => [Response] handler function, aka
[Fetch handlers](https://blog.val.town/blog/the-api-we-forgot-to-name/).

[Request]: https://developer.mozilla.org/en-US/docs/Web/API/Request
[Response]: https://developer.mozilla.org/en-US/docs/Web/API/Response

These functions should be usable on any platform that supports the web
standards: Deno, Bun, Cloudflare Workers, browsers, ServiceWorker.

There is also a platform specific
[@http/route-deno](https://jsr.io/@http/route-deno) package that provides static
routing functions.

## An Example

Let's start with a really simple example, a router for `GET /hello`...

```ts
import { handle } from "@http/route/handle";
import { byPattern } from "@http/route/by-pattern";
import { byMethod } from "@http/route/by-method";

Deno.serve(handle([
  byPattern(
    "/hello",
    byMethod({
      GET: () => {
        return new Response("Hello world");
      },
    }),
  ),
]));
```

This may be a fairly difference approach to the routers you are used to.

The main idea is to compose your router from simple `Request` => `Response`
functions, rather than calling methods on a router builder object.

Let's take a look at each part of the example, starting with `byPattern` (we'll
come back to `handle` later):

```ts
byPattern(
  "/hello",
  ...
)
```

This function actually creates a handler function, which attempts to match the
request URL against the given pattern, and if it matches calls the handler given
in its 2nd arg, in this case...

```ts
byMethod({
  GET: ...
})
```

Again this creates another handler function, which attempts to match the request
HTTP method against a key in the given record of method => handlers. If it
matches the HTTP method, the associated handler is called...

<!-- deno-fmt-ignore-start -->
```ts
() => {
  return new Response("Hello world");
}
```
<!-- deno-fmt-ignore-end -->

So, this will be the handler function for `GET /hello`, the function is passed
the `Request` and returns a `Response`.

But what if the user hits `GET /other`, and `byPattern` doesn't match the
pattern?

Well the function can return `null` to indicate that this request cannot be
handled, and this is where `handle` comes in. It can take an array of handlers,
and try each one until a non-null response is returned, and if no response comes
a fallback handler is invoked. By default returning a `404 Not Found`, but a
different fallback function can be supplied where necessary.

Although `handle` itself is just a convenience function for a common combination
of `cascade` and `withFallback` functions, which can be used independently for a
more flexible approach.

The separate
[@http/examples](https://github.com/jollytoad/deno_http_fns/tree/main/packages/examples)
packages provides more examples of usage.

## Common handler concepts

### Response or null

Although based on `Request` => `Response` functions, there is a little more to
it than that, for example, many functions produced by the `by*` helpers may also
return `null` instead of a `Response`, and where a regular handler is required
the `withFallback` function can be used to catch the `null` and return a
concrete `Response`. The `Response` or `null` may also be as a promise.

### Additional arguments

Also, many handlers may also accept additional arguments beyond the first
`Request`, for example, in the case of `byPatten(pattern, handler)`, the
`handler` is given the request and the pattern match result as arguments...

```ts
((request: Request, match: URLPatternResult) => Awaitable<Response | null>);
```

### Argument shunting

Most of the `by*` helpers will pass arguments on as is, or shunt the arguments
along if they want to introduce their own, so for example,
`byPattern(pattern, handler)` returns a handler with the type:

```ts
(request: Request, ...additionalArgs: SomeArgsType) => ...
```

but the actual `handler` you pass to it is actually...

```ts
(request: Request, match: URLPatternResult, ...additionalArgs: SomeArgsType) => ...
```

It has the extra `match` argument insert before all other arguments that are
just passed along.

This allows the handlers created via `by*` helpers to work with a wide variety
of other frameworks, as it's totally agnostic to the extra arguments beyond the
`Request`. So when you use these functions with `Deno.serve` for example, your
pattern handler function will actually have the signature:

```ts
(request: Request, match: URLPatternResult, info: Deno.ServeHandlerInfo) => ...
```

So you still have this extra context available to you in your handler.

## Take a look inside

This is just a library of functions, and these are kept as simple a possible
with the intention that it is easy to take a look inside of each function and
see exactly what it does, the documentation below links to the source of each
function and an example of it's usage, and I encourage you follow these and take
a good look at the code.

Also, in general each module represents a single function, intended to be
imported individually, so you only import exactly what you need, not a mountain
of unused features. You'll find no `mod.ts` or `deps.ts` around here.

## Examples

There are many [examples](https://jsr.io/@http/examples) that can be executed
directly, and many tests for these examples.

You can run them after cloning this repo, for example:

```sh
deno task example packages/examples/logging.ts
```

or directly from jsr:

```sh
deno run -A jsr:@http/examples/logging
```

Many of the examples have accompanying tests, which I hope to improve coverage
of as time permits. I'd encourage you to take a look at the tests to see how
each example can be exercised. You can also run the whole test suite simply
with:

```sh
deno task test
```
