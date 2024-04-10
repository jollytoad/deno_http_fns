import { withFallback } from "@http/route/with-fallback";
import { intercept } from "@http/interceptor/intercept";
import { cascade } from "@http/route/cascade";
import { byPattern } from "@http/route/by-pattern";
import { ok } from "@http/response/ok";
import { whenPattern } from "@http/interceptor/when-pattern";
import { verifyHeader } from "@http/interceptor/verify-header";
import { unauthorized } from "@http/response/unauthorized";

// This is an example of using the `whenPattern` interceptor to protect a specific route.
//
// All routes within the site are publicly accessible, except for routes under `/private`,
// for which a regular HTTP Basic Authorization is required.

const server = Deno.serve(
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
