/**
 * This is an example of serving a routes module generated using
 * {@linkcode generateRoutesModule} at development time.
 *
 * This example demonstrates the generation of the actual `routes.ts`
 * module at development time, and needs access to the filesystem.
 * So, unlike other examples, it cannot be run directly from JSR.
 *
 * If you checkout this repo with git though, you can run it from
 * the local filesystem:
 *
 * ```sh
 * rm ./packages/examples/_routes.ts
 * deno task example ./packages/examples/generated_routes.ts
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

import generateRoutes from "./scripts/generate_routes.ts";
import { withFallback } from "@http/route/with-fallback";
import { port } from "@http/host-deno-local/port";
import { lazy } from "@http/route/lazy";

await generateRoutes();

// Dynamically import the possibly newly generated or modified
// route module. This is only necessary during development, the
// production entry could statically import the routes module.
const routes = lazy(import.meta.resolve("./_routes.ts"));

const server = Deno.serve(
  { port: port() },
  withFallback(routes),
) as Deno.HttpServer;

export default server;
