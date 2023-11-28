# deno_http_fns

NOTE: This is still fairly experimental.

A collection of functions for HTTP.

- Based on Request => Response functions
- Works with [`Deno.serve`][deno_serve]
- Handlers for routing based on various criteria
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

Read the [blog].

[deno_serve]: https://deno.land/api?s=Deno.serve
[blog]: https://jollytoad.deno.dev/blog/http_fns

## Examples

See the [examples](./examples).

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

## Request Handlers

Most functions could be considered as handler factories, in that they create and
return a Request handler function, generally of the form:

`(req: Request, data: unknown) => Response`

Response can also be in a Promise, and in many case may also be `null` to
indicate that the Request cannot be handled and it should be delegated to
another handler.

Here is a very simple example of how the functions can be composed into a
server:

```ts
await serve(
  handle([
    byPattern(
      "/",
      byMethod({
        GET: () => ok("Hello"),
      }),
    ),
    byPattern(
      "/foo",
      byMethod({
        GET: () => ok("Foo"),
      }),
    ),
  ]),
);
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
