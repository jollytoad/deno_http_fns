/**
 * This is an example of using the {@linkcode cors} interceptor.
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/cors
 * ```
 *
 * The `byMethod` handler supplies the implicit OPTIONS handler, so the Cors
 * interceptor can expand the `Allow` header into
 * `Access-Control-Allow-Methods` on CORS pre-flight requests.
 *
 * @module
 */

import { intercept } from "@http/interceptor/intercept";
import { cors } from "@http/interceptor/cors";
import { byMethod } from "@http/route/by-method";
import { handle } from "@http/route/handle";
import { withFallback } from "@http/route/with-fallback";
import { ok } from "@http/response/ok";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  withFallback(
    intercept(
      handle([byMethod({
        GET: () => ok("Hello"),
      })]),
      cors(),
    ),
  ),
) as Deno.HttpServer;

export default server;
