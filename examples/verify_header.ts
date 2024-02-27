import { ok } from "@http/fns/response/ok.ts";
import { intercept } from "@http/fns/intercept.ts";
import { withFallback } from "@http/fns/with_fallback.ts";
import { verifyHeader } from "@http/fns/_mod.ts";
import { forbidden } from "@http/fns/response/forbidden.ts";

// This is an example of using the `verifyHeader` interceptor to check that
// the imagined "X-Access-Token" matches a specific value.

export default Deno.serve(
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
);
