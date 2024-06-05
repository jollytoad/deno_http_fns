import { withFallback } from "@http/route/with-fallback";
import { intercept } from "@http/interceptor/intercept";
import { logging } from "@http/interceptor/logger";
import type { Awaitable, Interceptors } from "@http/interceptor/types";

/**
 * Convenience function to generate Deno.serve init parameter for Deno Deploy.
 */
export default function initDeploy(
  handler: (
    req: Request,
    info: Deno.ServeHandlerInfo,
  ) => Awaitable<Response | null>,
  ...interceptors: Interceptors<unknown[], Response>[]
): Deno.ServeInit & (Deno.ServeOptions | Deno.ServeTlsOptions) {
  return {
    handler: intercept(withFallback(handler), logging(), ...interceptors),
  };
}
