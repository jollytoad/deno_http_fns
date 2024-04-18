# Response functions

A bunch of functions to aid creation and manipulation of the standard
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).

## Response creation shortcuts

These functions are simple common shortcuts for creating Response objects.

Error responses return plain text messages, if you want an alternative
content-type, use a `new Response` instead, or use some middleware or an
[interceptor](https://jsr.io/@http/interceptor) to modify the response, wrapping
the message in a richer format.

If a particular status hasn't been covered it may be because:

- possible options are too complex to cover in a simple function, best to just
  use `new Response` in that case
- it's been deprecated, or superseded by a preferred alternative (eg. 301 =>
  308, 302 => 307)
- it's not yet been required in a real situation

Please raise an issue to request additional functions if you have a genuine need
for it, and can suggest a simple and generally reusable signature.

| Status                                                                                            | Function                                                            |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [200 OK](https://www.rfc-editor.org/rfc/rfc9110.html#name-200-ok)                                 | [ok()](./ok.ts)                                                     |
| [202 Accepted](https://www.rfc-editor.org/rfc/rfc9110.html#name-202-accepted)                     | [accepted()](./accepted.ts)                                         |
| [204 No Content](https://www.rfc-editor.org/rfc/rfc9110.html#name-204-no-content)                 | [noContent()](./no_content.ts), or [ok](./ok.ts) with a `null` body |
| [303 See Other](https://www.rfc-editor.org/rfc/rfc9110.html#name-303-see-other)                   | [seeOther()](./see_other.ts)                                        |
| [304 Not Modified](https://www.rfc-editor.org/rfc/rfc9110.html#name-304-not-modified)             | [notModified()](./not_modified.ts)                                  |
| [307 Temporary Redirect](https://www.rfc-editor.org/rfc/rfc9110.html#name-307-temporary-redirect) | [temporaryRedirect()](./temporary_redirect.ts)                      |
| [308 Permanent Redirect](https://www.rfc-editor.org/rfc/rfc9110.html#name-308-permanent-redirect) | [permanentRedirect()](./permanent_redirect.ts)                      |
| [400 Bad Request](https://www.rfc-editor.org/rfc/rfc9110.html#name-400-bad-request)               | [badRequest()](./bad_request.ts)                                    |
| [401 Unauthorized](https://www.rfc-editor.org/rfc/rfc9110.html#name-401-unauthorized)             | [unauthorized()](./unauthorized.ts)                                 |
| [403 Forbidden](https://www.rfc-editor.org/rfc/rfc9110.html#name-403-forbidden)                   | [forbidden()](./forbidden.ts)                                       |
| [404 Not Found](https://www.rfc-editor.org/rfc/rfc9110.html#name-404-not-found)                   | [notFound()](./not_found.ts)                                        |
| [405 Method Not Allowed](https://www.rfc-editor.org/rfc/rfc9110.html#name-405-method-not-allowed) | [methodNotAllowed()](./method_not_allowed.ts)                       |
| [406 Not Acceptable](https://www.rfc-editor.org/rfc/rfc9110.html#name-406-not-acceptable)         | [notAcceptable()](./not_acceptable.ts)                              |
| [502 Bad Gateway](https://www.rfc-editor.org/rfc/rfc9110.html#name-502-bad-gateway)               | [badGateway()](./bad_gateway.ts)                                    |

## Common Content-Type Responses

- [html()](./html.ts) creates a `200 OK` response with a `text/html`
  content-type.
- [json()](./json.ts) serializes the given value to JSON in a `200 OK` response
  with an `application/json` content-type.

## Header manipulation

The functions [appendHeaders()](./append_headers.ts) and
[setHeaders()](./set_headers.ts) allow you to alter the headers of a Response,
including copying the Response if it's immutable.

These can be useful within middleware/interceptors to add additional headers to
the Response from a handler.

## Body manipulation

- [replaceBody()](./replace_body.ts) allows you to duplicate a Response but with
  an alternative body.
- [prependDocType()](./prepend_doctype.ts) allows you to prepend
  `<!DOCTYPE html>` to a html body whilst preserving its streaming capabilities,
  mostly useful in conjunction with JSX generated content.

## Conditional Responses

- [conditional()](./conditional.ts) will inspect a given Request and Response,
  and determine whether you need to actually return the Response or a
  `304 Not Modified` instead.
