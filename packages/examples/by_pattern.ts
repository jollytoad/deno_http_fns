/**
 * This is an example of using {@linkcode byPattern} to determine
 * whether a handler function should handle the request based on
 * its URL. It 'skips' (returns `null`) if the pattern doesn't
 * match.
 *
 * {@linkcode withFallback} is used to handle the case where the
 * handler skips.
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/by-pattern
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
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  withFallback(
    byPattern("/:path*", (_req, match) => {
      return new Response(`You are at ${match.pathname.groups.path}`);
    }),
  ),
) as Deno.HttpServer;

export default server;
