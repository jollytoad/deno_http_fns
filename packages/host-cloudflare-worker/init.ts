import { withFallback } from "@http/route/with-fallback";
import { intercept } from "@http/interceptor/intercept";
import type { Interceptors } from "@http/interceptor/types";
import type { Awaitable, Env, ExportedHandler, HandlerArgs } from "./types.ts";

/**
 * Convenience function to generate the default export for a Cloudflare Worker.
 */
export default function initCloudflareWorker<E extends Env>(
  handler: (
    req: Request,
    ...args: HandlerArgs<E>
  ) => Awaitable<Response | null>,
  ...interceptors: Interceptors<HandlerArgs<E>, Response>[]
): ExportedHandler<E> {
  return {
    fetch: intercept(
      withFallback(handler),
      ...interceptors,
    ),
  };
}
