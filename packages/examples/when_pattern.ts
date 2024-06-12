/**
 * This is an example of using {@linkcode whenPattern} to filter
 * the application of an intercept based on the URL of the request.
 *
 * In this case it protects all resources under `/private` with
 * a password, but allows anonymous access to everything else.
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/when-pattern
 * ```
 *
 * And try hitting the following URLs in your browser:
 *
 * - http://localhost:8000
 * - http://localhost:8000/public/stuff
 * - http://localhost:8000/private/stuff
 *
 * Enter `username` and `password` when prompted for credentials.
 *
 * @module
 */

import { withFallback } from "@http/route/with-fallback";
import { intercept } from "@http/interceptor/intercept";
import { cascade } from "@http/route/cascade";
import { byPattern } from "@http/route/by-pattern";
import { ok } from "@http/response/ok";
import { whenPattern } from "@http/interceptor/when-pattern";
import { verifyHeader } from "@http/interceptor/verify-header";
import { unauthorized } from "@http/response/unauthorized";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  withFallback(
    intercept(
      // This is the main set of handlers...
      cascade(
        byPattern("/private{/*}?", () => ok("This is private stuff")),
        byPattern("/*", () => ok("This is public stuff")),
      ),
      {
        // These are the Request Interceptors...
        request: [
          whenPattern(
            "/private{/*}?",
            verifyHeader({
              header: "Authorization",
              value: `Basic ${btoa("username:password")}`,
              reject: () => unauthorized("Basic realm=Private"),
            }),
          ),
        ],
      },
    ),
  ),
) as Deno.HttpServer;

export default server;
