import { withFallback } from "https://deno.land/x/http_fns/lib/with_fallback.ts";
import { intercept } from "https://deno.land/x/http_fns/lib/intercept.ts";
import { unauthorized } from "https://deno.land/x/http_fns/lib/response/unauthorized.ts";
import { byPattern } from "https://deno.land/x/http_fns/lib/by_pattern.ts";

export default Deno.serve(
  withFallback(
    intercept(
      // This is the main handler...
      byPattern("/", () => {
        return new Response("Hello world");
      }),
      {
        // This is a RequestInterceptor that requires the Request to have an
        // Authorization header otherwise responds with a `401 Unauthorized`,
        // and asks for credentials.
        request: [(req) => {
          if (!req.headers.has("Authorization")) {
            return unauthorized(`Basic realm="Who are you?"`);
          }
        }],
      },
    ),
  ),
);
