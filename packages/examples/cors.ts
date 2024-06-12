import { intercept } from "@http/interceptor/intercept";
import { cors } from "@http/interceptor/cors";
import { port } from "@http/host-deno-local/port";

/**
 * This is an example of using the {@linkcode cors} interceptor.
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/cors
 * ```
 *
 * *TODO: This needs a more complete demo!*
 *
 * @module
 */

const server = Deno.serve(
  { port: port() },
  intercept(
    () => new Response("Hello"),
    cors(),
  ),
) as Deno.HttpServer;

export default server;
