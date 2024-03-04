import { withFallback } from "@http/fns/with_fallback";
import { intercept } from "@http/fns/intercept";
import { cascade } from "@http/fns/cascade";
import { byPattern } from "@http/fns/by_pattern";
import { ok } from "@http/fns/response/ok";
import { whenPattern } from "@http/fns/interceptor/when_pattern";
import { verifyHeader } from "@http/fns/interceptor/verify_header";
import { unauthorized } from "@http/fns/response/unauthorized";

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
