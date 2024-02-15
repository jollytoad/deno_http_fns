import { withFallback } from "https://deno.land/x/http_fns/lib/with_fallback.ts";
import { intercept } from "https://deno.land/x/http_fns/lib/intercept.ts";
import { cascade } from "https://deno.land/x/http_fns/lib/cascade.ts";
import { byPattern } from "https://deno.land/x/http_fns/lib/by_pattern.ts";
import { ok } from "https://deno.land/x/http_fns/lib/response/ok.ts";
import { whenPattern } from "https://deno.land/x/http_fns/lib/interceptor/when_pattern.ts";
import { verifyHeader } from "https://deno.land/x/http_fns/lib/interceptor/verify_header.ts";
import { unauthorized } from "https://deno.land/x/http_fns/lib/_mod.ts";

// This is an example of using the `whenPattern` interceptor to protect a specific route.
//
// All routes within the site are publicly accessible, except for routes under `/private`,
// for which a regular HTTP Basic Authorization is required.

export default Deno.serve(
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
);
