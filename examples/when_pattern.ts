import { withFallback } from "@http/fns/with_fallback.ts";
import { intercept } from "@http/fns/intercept.ts";
import { cascade } from "@http/fns/cascade.ts";
import { byPattern } from "@http/fns/by_pattern.ts";
import { ok } from "@http/fns/response/ok.ts";
import { whenPattern } from "@http/fns/interceptor/when_pattern.ts";
import { verifyHeader } from "@http/fns/interceptor/verify_header.ts";
import { unauthorized } from "@http/fns/response/unauthorized.ts";

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
