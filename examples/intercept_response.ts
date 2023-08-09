import { staticRoute } from "https://deno.land/x/http_fns/static.ts";
import { withFallback } from "https://deno.land/x/http_fns/fallback.ts";
import {
  interceptResponse,
  skip,
} from "https://deno.land/x/http_fns/intercept.ts";
import { notFound } from "https://deno.land/x/http_fns/response/not_found.ts";
import { byStatus } from "https://deno.land/x/http_fns/status.ts";
import { cascade } from "https://deno.land/x/http_fns/cascade.ts";
import { byPattern } from "https://deno.land/x/http_fns/pattern.ts";
import { forbidden } from "https://deno.land/x/http_fns/response/forbidden.ts";

// This is an example of using intercept to handle 40x responses.
//
// For the case of a `404 Not Found` response within the main cascade, it will be
// converted to a skipped response (null), and handled by the custom fallback handler.
//
// A `403 Forbidden` response will be caught by the `byStatus` interceptor and a custom
// forbidden message will be returned.

Deno.serve(
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
