import { withFallback } from "@http/route/with-fallback";
import { cascade } from "@http/route/cascade";
import { byPattern } from "@http/route/by-pattern";
import { port } from "@http/host-deno-local/port";

/**
 * This is an example of using {@linkcode cascade} to delegate
 * request handling attempts to a chain of handler functions.
 * Where each function is called in turn until one returns a
 * `Response` rather than a `null` (or other falsy value).
 * If all of the delegate handlers skip then the cascade
 * handler also skips (ie. returns `null`).
 *
 * {@linkcode withFallback} is used to handle the case where the
 * handler skips. Also see {@linkcode handle}, which combines
 * these two functions.
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/cascade
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
  withFallback(
    cascade(
      byPattern("/hello", () => {
        return new Response("Hello world");
      }),
      byPattern("/more/:path*", (_req, match) => {
        return new Response(`You want more at ${match.pathname.groups.path}`);
      }),
    ),
  ),
) as Deno.HttpServer;

export default server;
