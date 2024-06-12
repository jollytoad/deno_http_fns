import { withFallback } from "@http/route/with-fallback";
import { dynamicRoute } from "@http/discovery/dynamic-route";
import freshPathMapper from "@http/discovery/fresh-path-mapper";
import { port } from "@http/host-deno-local/port";

/**
 * This is an example of using {@linkcode dynamicRoute} to dynamically
 * build a router from a filesystem convention.
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/dynamic-route
 * ```
 *
 * And try hitting the following URLs in your browser:
 *
 * - http://localhost:8000
 * - http://localhost:8000/methods
 * - http://localhost:8000/user/bob
 *
 * @module
 */

const server = Deno.serve(
  { port: port() },
  withFallback(
    dynamicRoute({
      pattern: "/",
      fileRootUrl: import.meta.resolve("./_routes"),
      pathMapper: freshPathMapper,
      eagerness: "startup",
      verbose: true,
    }),
  ),
) as Deno.HttpServer;

export default server;
