/**
 * This is an example of using the {@linkcode intercept} to
 * register a custom interceptor that checks that the
 * `Request` contains an `Authorization` header.
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/intercept-auth
 * ```
 *
 * And try hitting the following URLs in your browser:
 *
 * - http://localhost:8000
 *
 * You can supply any username and password when prompted.
 *
 * @module
 */

import { withFallback } from "@http/route/with-fallback";
import { intercept } from "@http/interceptor/intercept";
import { unauthorized } from "@http/response/unauthorized";
import { byPattern } from "@http/route/by-pattern";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  withFallback(
    intercept(
      // This is the main handler...
      byPattern("/", () => {
        return new Response("Hello world");
      }),
      {
        // This is a RequestInterceptor that requires the Request to have an
        // Authorization header otherwise responds with a `401 Unauthorized`,
        // and asks for credentials.
        request: [(req) => {
          if (!req.headers.has("Authorization")) {
            return unauthorized(`Basic realm="Who are you?"`);
          }
        }],
      },
    ),
  ),
) as Deno.HttpServer;

export default server;
