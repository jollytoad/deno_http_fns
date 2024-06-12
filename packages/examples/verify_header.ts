import { ok } from "@http/response/ok";
import { intercept } from "@http/interceptor/intercept";
import { withFallback } from "@http/route/with-fallback";
import { verifyHeader } from "@http/interceptor/verify-header";
import { forbidden } from "@http/response/forbidden";
import { port } from "@http/host-deno-local/port";

/**
 * This is an example of using the {@linkcode verifyHeader} interceptor
 * to check that the imagined "X-Access-Token" header matches a specific value.
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/verify-header
 * ```
 *
 * Use a non-browser client, to set the header value:
 *
 * ```sh
 * curl http://localhost:8000
 * curl -H "X-Access-Token: super-secret-token" http://localhost:8000
 * curl -H "X-Access-Token: wrong-secret-token" http://localhost:8000
 * ```
 *
 * @module
 */

const server = Deno.serve(
  { port: port() },
  withFallback(
    intercept(
      () => ok("You have access"),
      {
        request: [
          verifyHeader({
            header: "X-Access-Token",
            value: "super-secret-token",
            reject: () => forbidden("You are not welcome here"),
          }),
        ],
      },
    ),
  ),
) as Deno.HttpServer;

export default server;
