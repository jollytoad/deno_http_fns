/**
 * This is an example of using {@linkcode byMediaType} to switch
 * between handler functions depending on the requested media type
 * via the `Accept` header, or a file extension on the URL path.
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/by-media-type
 * ```
 *
 * And try hitting the following URLs in your browser:
 *
 * - http://localhost:8000/hello
 * - http://localhost:8000/hello.html
 * - http://localhost:8000/hello.txt
 * - http://localhost:8000/hello.json
 *
 * also, from a non-browser client, setting the Accept header:
 *
 * ```sh
 * curl -H "Accept: text/html" http://localhost:8000/hello
 * curl -H "Accept: text/plain" http://localhost:8000/hello
 * curl -H "Accept: application/json" http://localhost:8000/hello
 * ```
 *
 * @module
 */

import { handle } from "@http/route/handle";
import { byPattern } from "@http/route/by-pattern";
import { byMethod } from "@http/route/by-method";
import { byMediaType } from "@http/route/by-media-type";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  handle([
    byPattern(
      "/hello{.:ext}?",
      byMethod({
        GET: byMediaType({
          "text/plain": () => {
            return new Response("Hello world");
          },
          "text/html": () => {
            return new Response(
              "<html><body><h1>Hello world</h1></body></html>",
              {
                headers: {
                  "Content-Type": "text/html",
                },
              },
            );
          },
          "application/json": () => {
            return new Response(
              JSON.stringify("Hello world"),
              {
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );
          },
        }),
      }),
    ),
  ]),
) as Deno.HttpServer;

export default server;
