# Routing delegation functions

## handle

`handle(handlers, fallback) => Handler`

[Module](../packages/route/handle.ts) |
[Example](../packages/examples/handle.ts)

This is the top-level function you'll use to form a router.

You pass it a list of handlers, each handler may return either a `Response` or a
`null`. If the handler returns `null`, the next handler is called until a
`Response` is returned, or it will end by calling the optional `fallback`
handler which must return a `Response`.

The default fallback is to return a `404 Not Found` response.

(`handle` is actually just a shortcut for `cascade` & `withFallback`, discussed
below)

## cascade

`cascade(...handlers) => Handler`

[Module](../packages/route/cascade.ts) |
[Example](../packages/examples/cascade.ts)

Attempt each handler in turn until one returns a Response.

## withFallback

`withFallback(handler, fallback) => Handler`

[Module](../packages/route/with_fallback.ts) |
[Example](../packages/examples/by_pattern.ts) |
[Example](../packages/examples/cascade.ts)

Provide a fallback Response should the handler 'skip' (ie. return no response).

The `fallback` handler MUST return a response, although it's an optional
argument and the default fallback handler will just return a `404 Not Found`.

## lazy

`lazy(module url or loader) => Handler`

[Module](../packages/handler/lazy.ts) | [Example](../packages/examples/lazy.ts)
| [Test](../packages/examples/lazy.test.ts)

Dynamically load a handler when first required.
