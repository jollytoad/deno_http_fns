/**
 * This is an example of using {@linkcode bySubPattern} to narrow
 * down a URL match after already using {@linkcode byPattern}.
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/by-sub-pattern
 * ```
 *
 * And try hitting the following URLs in your browser:
 *
 * - http://localhost:8000/hello/world
 * - http://localhost:8000/somewhere/else
 *
 * @module
 */

import { withFallback } from "@http/route/with-fallback";
import { byPattern } from "@http/route/by-pattern";
import { bySubPattern } from "@http/route/by-sub-pattern";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  withFallback(
    byPattern(
      "/:foo/*",
      bySubPattern("*/:bar", (_req, match) => {
        return new Response(`
You are at ${match.pathname.input}
:foo = ${match.pathname.groups.foo}
:bar = ${match.pathname.groups.bar}
`);
      }),
    ),
  ),
) as Deno.HttpServer;

export default server;
