/**
 * This is an example of using {@linkcode byMethod} to switch
 * between handler functions depending on the method of the request,
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/by-method
 * ```
 *
 * And try hitting the following URLs in your browser:
 *
 * - http://localhost:8000/hello
 * - http://localhost:8000/something
 *
 * also, from a non-browser client, setting the request method:
 *
 * ```sh
 * curl -v http://localhost:8000/something
 * curl -v -X PUT http://localhost:8000/something
 * curl -v -X POST http://localhost:8000/something  # responds with Method Not Allowed
 * curl -v --head http://localhost:8000/something
 * curl -v -X OPTIONS http://localhost:8000/something
 * ```
 *
 * The `HEAD` and `OPTIONS` handlers are implicitly provided by `byMethod`
 * if you don't supply your own.
 *
 * @module
 */

import { handle } from "@http/route/handle";
import { byPattern } from "@http/route/by-pattern";
import { byMethod } from "@http/route/by-method";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  handle([
    byPattern(
      "/hello",
      byMethod({
        GET: () => {
          return new Response("Hello world");
        },
      }),
    ),
    byPattern(
      "/:path*",
      byMethod({
        GET: (_req, match) => {
          return new Response(`GET from ${match.pathname.groups.path}`);
        },
        PUT: (_req, match) => {
          return new Response(`PUT to ${match.pathname.groups.path}`);
        },
      }),
    ),
  ]),
) as Deno.HttpServer;

export default server;
