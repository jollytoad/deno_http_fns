import { ok } from "https://deno.land/x/http_fns/lib/response/ok.ts";
import { intercept } from "https://deno.land/x/http_fns/lib/intercept.ts";
import { withFallback } from "https://deno.land/x/http_fns/lib/with_fallback.ts";
import { verifyHeader } from "https://deno.land/x/http_fns/lib/_mod.ts";
import { forbidden } from "https://deno.land/x/http_fns/lib/response/forbidden.ts";

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
