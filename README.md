# deno_http_fns

NOTE: This is still fairly experimental.

A collection of functions for HTTP.

- Based on Request => Response functions
- Works with Deno std lib `serve`
- Handlers for routing based on various criteria

Read the [blog][https://jollytoad.deno.dev/blog/http_fns].

## Example

See the [demo](./demo/serve.ts).

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

### byMethod

### byMediaType

## Delegation

### cascade

### withFallback

## Handlers

### staticRoute

## Middleware

### intercept

### interceptResponse

### skip

### loggers

### cors

## Utilities

### Request

### Response
