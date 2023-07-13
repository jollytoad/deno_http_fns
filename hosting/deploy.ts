import { withFallback } from "../fallback.ts";
import { intercept } from "../intercept.ts";
import { logging } from "../logger.ts";
import type { Args, CustomHandler, Interceptors } from "../types.ts";

/**
 * Convenience function to generate Deno.serve init parameter for Deno Deploy.
 */
export default async function initDeploy(
  handler: CustomHandler,
  ...interceptors: Interceptors<Args, Response>[]
): Promise<Deno.ServeInit & (Deno.ServeOptions | Deno.ServeTlsOptions)> {
  return {
    handler: intercept(withFallback(handler), logging(), ...interceptors),
  };
}
