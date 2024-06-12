import { handle } from "@http/route/handle";
import { byPattern } from "@http/route/by-pattern";
import { port } from "@http/host-deno-local/port";

/**
 * This is an example of using {@linkcode handle} to delegate
 * request handling attempts to a chain of handler functions.
 * Where each function is called in turn until one returns a
 * `Response` rather than a `null` (or other falsy value).
 * It implicitly handles fallback when all handlers skip,
 * and therefore always returns a `Response`.
 *
 * It's a common shortcut to using {@linkcode cascade} and
 * {@linkcode withFallback}.
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/handle
 * ```
 *
 * And try hitting the following URLs in your browser:
 *
 * - http://localhost:8000/hello
 * - http://localhost:8000/more/things
 * - http://localhost:8000/nonexistent
 *
 * @module
 */

const server = Deno.serve(
  { port: port() },
  handle([
    byPattern("/hello", () => {
      return new Response("Hello world");
    }),
    byPattern("/more/:path*", (_req, match) => {
      return new Response(`You want more at ${match.pathname.groups.path}`);
    }),
  ]),
) as Deno.HttpServer;

export default server;
