import { staticRoute } from "@http/route-deno/static-route";
import { withFallback } from "@http/route/with-fallback";
import { interceptResponse, skip } from "@http/interceptor/intercept";
import { notFound } from "@http/response/not-found";
import { byStatus } from "@http/interceptor/by-status";
import { cascade } from "@http/route/cascade";
import { byPattern } from "@http/route/by-pattern";
import { forbidden } from "@http/response/forbidden";

// This is an example of using intercept to handle 40x responses.
//
// For the case of a `404 Not Found` response within the main cascade, it will be
// converted to a skipped response (null), and handled by the custom fallback handler.
//
// A `403 Forbidden` response will be caught by the `byStatus` interceptor and a custom
// forbidden message will be returned.

const server = Deno.serve(
  withFallback(
    interceptResponse(
      // This is the main set of handlers...
      cascade(
        byPattern("/private", () => forbidden()),
        staticRoute("/", import.meta.resolve("./public"), { quiet: false }),
      ),
      // These are the Response Interceptors...
      skip(404),
      byStatus(
        403,
        () => forbidden("I'm sorry Dave, but I'm afraid you can't do that."),
      ),
    ),
    // Custom Not Found handler
    () => notFound("I'm sorry Dave, but I'm afraid I can't find that."),
  ),
) as Deno.HttpServer;

export default server;
