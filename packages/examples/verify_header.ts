import { ok } from "@http/response/ok";
import { intercept } from "@http/interceptor/intercept";
import { withFallback } from "@http/route/with-fallback";
import { verifyHeader } from "@http/interceptor/verify-header";
import { forbidden } from "@http/response/forbidden";
import { port } from "@http/host-deno-local/port";

// This is an example of using the `verifyHeader` interceptor to check that
// the imagined "X-Access-Token" matches a specific value.

const server = Deno.serve(
  { port: port() },
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
) as Deno.HttpServer;

export default server;
