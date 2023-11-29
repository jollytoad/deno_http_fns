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
import { handle } from "https://deno.land/x/http_fns/lib/handle.ts";
import { byPattern } from "https://deno.land/x/http_fns/lib/by_pattern.ts";
import { byMethod } from "https://deno.land/x/http_fns/lib/by_method.ts";

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

Most of the `by*` helpers will pass arguments along as it, or shunt the
arguments along if they want to introduce their own, so for example,
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

## Routing

### handle

`handle(handlers, fallback) => Handler`

[Module](./lib/handle.ts) | [Example](./examples/handle.ts)

This is the top-level function you'll use to form a router.

You pass it a list of handlers, each handler may return either a `Response` or a
`null`. If the handler returns `null`, the next handler is called until a
`Response` is returned, or it will end by calling the optional `fallback`
handler which must return a `Response`.

The default fallback is to return a `404 Not Found` response.

(`handle` is actually just a shortcut for `cascade` & `withFallback`, discussed
later)

### byPattern

`byPattern(pattern, handler) => Handler`

[Module](./lib/by_pattern.ts) | [Example](./examples/by_pattern.ts)

Every router needs a way to delegate by actual path or URL. `byPattern` provides
that using the standard
[URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern).

It can take a pattern or array of patterns, and the handler to be called on a
successful match.

The pattern can be a string (to match just the path), a `URLPatternInit` which
can declare patterns for other parts of the URL, or a pre-constructed
`URLPattern` itself.

The handler created will attempt to match the Request URL against each given
pattern in order until one matches, and then call the delegate handler (passed
in the 2nd arg of byPattern), with the Request and the `URLPatternResult`:

`(req: Request, match: URLPatternResult) => Response | null | Promise<Response | null>`

If no pattern matches, the handler returns `null`, allowing the request to
cascade to the next handler in the array of handlers passed to `handle` (or
`cascade`).

### bySubPattern

`bySubPattern(pattern, handler) => Handler`

[Module](./lib/by_sub_pattern.ts) | [Example](./examples/by_sub_pattern.ts)

Match a child route pattern after already matching a parent pattern.

### byMethod

`byMethod({ METHOD: handler }, fallback) => Handler`

[Module](./lib/by_method.ts) | [Example](./examples/by_method.ts)

Select a handler based on the request method.

### byMediaType

`byMediaType({ "media/type": handler }, fallbackExt, fallbackAccept) => Handler`

[Module](./lib/by_media_type.ts) | [Example](./examples/by_media_type.ts)

Select the most appropriate handler based on the desired media-type of the
request.

## Delegation

### cascade

`cascade(...handlers) => Handler`

[Module](./lib/cascade.ts) | [Example](./examples/cascade.ts)

Attempt each handler in turn until one returns a Response.

### withFallback

`withFallback(handler, fallback) => Handler`

[Module](./lib/fallback.ts) | [Example](./examples/by_pattern.ts) |
[Example](./examples/cascade.ts)

Provide a fallback Response should the handler 'skip' (ie. return no response).

### lazy

`lazy(module url or loader) => Handler`

[Module](./lib/lazy.ts)

Dynamically load a handler when first required.

## Handlers

### staticRoute

`staticRoute(pattern, fileRootUrl, options) => Handler`

[Module](./lib/static_route.ts) | [Example](./examples/static_route.ts)

Serve static files.

## Middleware

### intercept

`intercept(handler, ...interceptors) => Handler`

[Module](./lib/intercept.ts) | [Example](./examples/intercept_auth.ts)

Modify the Request and/or Response around the handler, and handle errors.

### interceptResponse

`interceptResponse(handler, ...responseInterceptors) => Handler`

[Module](./lib/intercept.ts) | [Example](./examples/intercept_response.ts)

Modify the Response from a handler.

### skip

`skip(...status) => ResponseInterceptor`

[Module](./lib/intercept.ts) | [Example](./examples/intercept_response.ts)

Use with `interceptResponse` to convert Responses of the given status to a
'skipped' response.

### byStatus

`byStatus(status, interceptor) => ResponseInterceptor`

[Module](./lib/by_status.ts) | [Example](./examples/intercept_response.ts)

Create a Response Interceptor that matches the status of the Response.

### loggers

`logging() => Interceptors`

[Module](./lib/logger.ts) | [Example](./examples/logging.ts)

A set of standard logging interceptors.

### cors

`cors(options) => ResponseInterceptor`

[Module](./lib/cors.ts)

A response intercept that adds the appropriate CORS headers, and handles the
OPTIONS request.

## Filesystem based handlers

### Route discovery

[Module](./lib/discover_routes.ts) |
[Example](./examples/scripts/discover_routes.ts)

Walk the filesystem discovering potential routes and handlers modules.

### Router module generation

[Module](./lib/generate_routes_module.ts) |
[Example script](./examples/scripts/generate_routes.ts) |
[Example of generated routes](./examples/routes.ts) |
[Example router](./examples/generated_routes.ts)

Generate a TypeScript module that exports a routing handler of discovered
modules, using `byPattern`.

### Dynamic runtime router

`dynamicRoute(options) => Handler`

[Module](./lib/dynamic_route.ts) | [Example](./examples/dynamic_route.ts)

A handler that performs route discovery dynamically at runtime.

## Utilities

### Request

_TODO_

### Response

_TODO_
