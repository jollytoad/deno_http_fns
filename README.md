# HTTP Functions for Deno

This is a collection of functions to aid building of a HTTP service in Deno.

They can be used instead of a monolithic router framework, or in tandem with
one.

## The bullet points

- A library of composable functions rather than a monolithic router class
- Based on web standard [Request] => [Response] functions
- Works with [`Deno.serve`][deno_serve]
- Routing based on various criteria
  - URLPattern
  - Method
  - Media Type
- Request and Response helper functions
- Generate router module from filesystem based handlers
  - Static or dynamic imports
  - Build time or runtime discovery
- Request/Response interceptor function chains
  - Logging
  - CORS
- `Deno.serve` options helper fns for various hosting scenarios
  - Development on localhost (including https support)
  - Deno Deploy

[Request]: https://developer.mozilla.org/en-US/docs/Web/API/Request
[Response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[deno_serve]: https://deno.land/api?s=Deno.serve

## An Example

Let's start with a really simple example, a router for `GET /hello`...

```ts
import { handle } from "jsr:@http/fns/handle";
import { byPattern } from "jsr:@http/fns/by_pattern";
import { byMethod } from "jsr:@http/fns/by_method";

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

As you can see this is a fairly difference approach to the routers you may be
used to.

The main idea is to compose your router from simple `Request` => `Response`
functions.

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
more flexible approach. See below for the full documentation of these.

You can read more about the concepts in the [blog], although it may not remain
totally up to date with the state of this library.

[blog]: https://jollytoad.deno.dev/blog/http_fns

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

There are many [examples](./examples) that can be executed directly, and many
tests for these examples.

You can run them after cloning this repo, for example:

```sh
deno run -A --import-map=examples/import_map.json examples/logging.ts
```

or (using a task defined in the deno.json file)

```sh
deno task example examples/logging.ts
```

(NOTE: The above will map the imports to use the local http_fns modules rather
than fetching from deno.land)

or directly from deno.land:

```sh
deno run -A https://deno.land/x/http_fns/examples/logging.ts
```

or directly from GitHub:

```sh
deno run -A https://raw.githubusercontent.com/jollytoad/deno_http_fns/main/examples/logging.ts
```

Many of the examples have accompanying tests, which I hope to improve coverage
of as time permits. I'd encourage you to take a look at the tests to see how
each example can be exercised. You can also run the whole test suite simply
with:

```sh
deno task test
```

## Functions

- Routing
  - [Criteria](./docs/routing_criteria.md)
    - `byPattern`
    - `bySubPattern`
    - `byMethod`
    - `byMediaType`
  - [Delegation](./docs/routing_delegation.md)
    - `handle`
    - `cascade`
    - `withFallback`
    - `lazy`
  - [Handlers](./docs/handlers.md)
    - `staticRoute`
  - [Filesystem](./docs/routing_filesystem.md)
    - `discoverRoutes`
    - `dynamicRoute`
    - `generateRoutesModule`
    - Fresh compatibility (_TODO_)
- [Interceptors](./docs/interceptors.md)
  - `intercept`
  - `interceptResponse`
  - `skip`
  - `byStatus`
  - `logging`
  - `cors`
- Utilities
  - [Request](./docs/request_utils.md)
  - [Response](./docs/response_utils.md)
- Hosting (_TODO_)
