import { staticRoute } from "@http/fns/static_route.ts";
import { withFallback } from "@http/fns/with_fallback.ts";
import { interceptResponse, skip } from "@http/fns/intercept.ts";
import { notFound } from "@http/fns/response/not_found.ts";
import { byStatus } from "@http/fns/interceptor/by_status.ts";
import { cascade } from "@http/fns/cascade.ts";
import { byPattern } from "@http/fns/by_pattern.ts";
import { forbidden } from "@http/fns/response/forbidden.ts";

// This is an example of using intercept to handle 40x responses.
//
// For the case of a `404 Not Found` response within the main cascade, it will be
// converted to a skipped response (null), and handled by the custom fallback handler.
//
// A `403 Forbidden` response will be caught by the `byStatus` interceptor and a custom
// forbidden message will be returned.

export default Deno.serve(
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
);
