import { ok } from "@http/fns/response/ok";
import { intercept } from "@http/fns/intercept";
import { withFallback } from "@http/fns/with_fallback";
import { verifyHeader } from "@http/fns/interceptor/verify_header";
import { forbidden } from "@http/fns/response/forbidden";

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
