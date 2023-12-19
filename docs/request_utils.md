# Request utility functions

## getBodyAsObject

`getBodyAsObject(request, processForm?) => Promise<Object>`

Attempt to read the body of the request as a plain object, handling JSON data,
multipart form data or URL encoded form data.

If the body is form data then the object is first read using
`Object.fromEntries`, and then optionally processed by the `processForm`
function if provided.

It does no other validation.

## requiredHeader

`requiredHeader(headerName) => (request) => string | never`

Attempt to get the value of a header from the request, throwing a
`400 Bad Request` if the header is not present or empty.

## getSearchValues

`getSearchValues(input) => (param, separator?) => string[]`

Get the value of a URL search parameter, optionally split on the given
`separator`. This will include values from all parameters of the same name.

It allows a flexible input of a `Request`, `URL`, `URLPatternResult` or
`URLSearchParams`.

## getUrlHeader

`getUrlHeader(headerName, "/"?) => (request) => URL | undefined`

Get a valid absolute URL from a request header, returning undefined if not
present or invalid. Will ensure a trailing `/` is included if given in the
arguments.
