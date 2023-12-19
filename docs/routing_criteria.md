# Routing criteria functions

## byPattern

`byPattern(pattern, handler) => Handler`

[Module](../lib/by_pattern.ts) | [Example](../examples/by_pattern.ts)

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

## bySubPattern

`bySubPattern(pattern, handler) => Handler`

[Module](../lib/by_sub_pattern.ts) | [Example](../examples/by_sub_pattern.ts)

Match a child route pattern after already matching a parent pattern.

## byMethod

`byMethod({ METHOD: handler }, fallback) => Handler`

[Module](../lib/by_method.ts) | [Example](../examples/by_method.ts) |
[Test](../examples/by_method.test.ts)

Select a handler based on the request method.

## byMediaType

`byMediaType({ "media/type": handler }, fallbackExt, fallbackAccept) => Handler`

[Module](../lib/by_media_type.ts) | [Example](../examples/by_media_type.ts) |
[Test](../examples/by_media_type.test.ts)

Select the most appropriate handler based on the desired media-type of the
request.
