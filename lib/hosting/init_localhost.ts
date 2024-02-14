import { withFallback } from "../with_fallback.ts";
import { intercept } from "../intercept.ts";
import { logging } from "../interceptor/logger.ts";
import { port } from "../port.ts";
import { loadKeyAndCert } from "../load_key_and_cert.ts";
import { logServerUrl } from "../server_url.ts";
import type { Awaitable, Interceptors } from "../types.ts";

/**
 * Convenience function to generate Deno.serve init parameter for localhost dev mode.
 */
export default async function initLocalhost(
  handler: (
    req: Request,
    info: Deno.ServeHandlerInfo,
  ) => Awaitable<Response | null>,
  ...interceptors: Interceptors<unknown[], Response>[]
): Promise<Deno.ServeInit & (Deno.ServeOptions | Deno.ServeTlsOptions)> {
  const keyAndCert = await loadKeyAndCert();
  return {
    handler: intercept(withFallback(handler), logging(), ...interceptors),
    ...keyAndCert,
    hostname: "::",
    port: port(),
    onListen: logServerUrl(keyAndCert),
  };
}
