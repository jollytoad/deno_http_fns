import { withFallback } from "@http/handler/with-fallback";
import { intercept } from "@http/interceptor/intercept";
import { unauthorized } from "@http/response/unauthorized";
import { byPattern } from "@http/route/by-pattern";

const server = Deno.serve(
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
) as Deno.HttpServer;

export default server;
