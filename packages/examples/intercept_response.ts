/**
 * This is an example of using the {@linkcode interceptResponse},
 * {@linkcode skip}, and {@linkcode whenStatus} to to handle 40x responses.
 *
 * For the case of a `404 Not Found` response within the main cascade,
 * it will be converted to a skipped response (null), and handled by
 * the custom fallback handler.
 *
 * A `403 Forbidden` response will be caught by the {@linkcode whenStatus}
 * interceptor and a custom forbidden message will be returned.
 *
 * This example uses the static file router, which unfortunately
 * cannot run directly from JSR at present.
 *
 * You can run the example from a checkout of this repo:
 *
 * ```sh
 * deno task example ./packages/examples/intercept_response.ts
 * ```
 *
 * And try hitting the following URLs in your browser:
 *
 * - http://localhost:8000/hello.txt
 * - http://localhost:8000/private
 * - http://localhost:8000/nonexistent
 *
 * @module
 */

import { staticRoute } from "@http/route-deno/static-route";
import { withFallback } from "@http/route/with-fallback";
import { interceptResponse } from "@http/interceptor/intercept-response";
import { skip } from "@http/interceptor/skip";
import { notFound } from "@http/response/not-found";
import { whenStatus } from "@http/interceptor/when-status";
import { cascade } from "@http/route/cascade";
import { byPattern } from "@http/route/by-pattern";
import { forbidden } from "@http/response/forbidden";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  withFallback(
    interceptResponse(
      // This is the main set of handlers...
      cascade(
        byPattern("/private", () => forbidden()),
        staticRoute("/", import.meta.resolve("./public")),
      ),
      // These are the Response Interceptors...
      skip(404),
      whenStatus(
        403,
        () => forbidden("I'm sorry Dave, but I'm afraid you can't do that."),
      ),
    ),
    // Custom Not Found handler
    () => notFound("I'm sorry Dave, but I'm afraid I can't find that."),
  ),
) as Deno.HttpServer;

export default server;
