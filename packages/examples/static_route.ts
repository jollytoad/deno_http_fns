/**
 * This is an example of using {@linkcode staticRoute} to serve
 * static files from the filesystem.
 *
 * This example requires filesystem access, and cannot run directly
 * from JSR at present.
 *
 * You can run the example from a checkout of this repo:
 *
 * ```sh
 * deno task example ./packages/examples/static_route.ts
 * ```
 *
 * And try hitting the following URLs in your browser:
 *
 * - http://localhost:8000/hello.txt
 *
 * @module
 */

import { staticRoute } from "@http/route-deno/static-route";
import { withFallback } from "@http/route/with-fallback";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  withFallback(
    staticRoute("/", import.meta.resolve("./public")),
  ),
) as Deno.HttpServer;

export default server;
