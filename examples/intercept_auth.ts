import { withFallback } from "https://deno.land/x/http_fns/fallback.ts";
import { intercept } from "https://deno.land/x/http_fns/intercept.ts";
import { unauthorized } from "https://deno.land/x/http_fns/response/unauthorized.ts";
import { byPattern } from "https://deno.land/x/http_fns/pattern.ts";

Deno.serve(
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
