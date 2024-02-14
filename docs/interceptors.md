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

[Module](../lib/interceptor/verify_header.ts)

Create a request interceptor that verifies that a header matches a given value.
Useful for token matching.
