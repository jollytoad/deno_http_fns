# Interceptors (aka Middleware)

## intercept

`intercept(handler, ...interceptors) => Handler`

[Module](../lib/intercept.ts) | [Example](../examples/intercept_auth.ts)

Modify the Request and/or Response around the handler, and handle errors.

## interceptResponse

`interceptResponse(handler, ...responseInterceptors) => Handler`

[Module](../lib/intercept.ts) | [Example](../examples/intercept_response.ts)

Modify the Response from a handler.

## skip

`skip(...status) => ResponseInterceptor`

[Module](../lib/intercept.ts) | [Example](../examples/intercept_response.ts)

Use with `interceptResponse` to convert Responses of the given status to a
'skipped' response.

## byStatus

`byStatus(status, interceptor) => ResponseInterceptor`

[Module](../lib/interceptor/by_status.ts) |
[Example](../examples/intercept_response.ts)

Create a Response Interceptor that matches the status of the Response.

## whenPattern

`whenPattern(pattern, interceptor) => RequestInterceptor`

[Module](../lib/interceptor/when_pattern.ts) |
[Example](../examples/when_pattern.ts)

Filter the application of the given interceptor for the given pattern.

This is the equivalent of `byPattern` for interceptors rather than handlers,
taking a pattern or array of patterns.

The pattern can be a string (to match just the path), a `URLPatternInit` which
can declare patterns for other parts of the URL, or a pre-constructed
[`URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern).

The interceptor created will attempt to match the Request URL against each given
pattern in order until one matches, and then call the delegate interceptor
(passed in the 2nd arg of forPattern), with the Request and the
`URLPatternResult`:

If no pattern matches, the interceptor returns `undefined`, allowing the request
to pass unmodified to the next interceptor and eventually to a handler.

## loggers

`logging() => Interceptors`

[Module](../lib/interceptor/logger.ts) | [Example](../examples/logging.ts)

A set of standard logging interceptors.

## cors

`cors(options) => ResponseInterceptor`

[Module](../lib/interceptor/cors.ts)

A response interceptor that adds the appropriate CORS headers, and handles the
OPTIONS request.

## verifyHeader

`verifyHeader(options) => RequestInterceptor`

[Module](../lib/interceptor/verify_header.ts) |
[Example](../examples/verify_header.ts) | [Example](../examples/when_pattern.ts)

Create a request interceptor that verifies that a header matches a given value.
Useful for token matching.
