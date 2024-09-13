import { html } from "@http/response/html";

/**
 * Wrap some html body content in full html markup.
 *
 * This is the actual wrapping function for the
 * `body()` route modules detected by the example
 * [handle mapper](./page_handler_mapper.ts) and
 * [handle generator](./page_handler_generator.ts).
 */
export function pageHandler(
  body: (req: Request) => string,
): (req: Request) => Response {
  return (req) =>
    html(`
<!DOCTYPE html>
<html>
  <body>
    ${body(req)}
  </body>
</html>
`);
}
