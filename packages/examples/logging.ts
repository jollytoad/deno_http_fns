/**
 * This is an example of using the {@linkcode logging} interceptor
 * to log request and response information to the console.
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/logging
 * ```
 *
 * And try hitting the following URLs in your browser:
 *
 * - http://localhost:8000/hello/world
 * - http://localhost:8000/somewhere/else
 *
 * Watch your console for the formatted log messages.
 *
 * @module
 */

import { intercept } from "@http/interceptor/intercept";
import { logging } from "@http/interceptor/logger";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  intercept(
    () => new Response("Hello"),
    logging(),
  ),
) as Deno.HttpServer;

export default server;
