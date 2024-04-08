import { withFallback } from "@http/handler/with-fallback";
import { intercept } from "@http/interceptor/intercept";
import { logging } from "@http/interceptor/logger";
import { port } from "./port.ts";
import { loadKeyAndCert } from "./load_key_and_cert.ts";
import { logServerUrl } from "./server_url.ts";
import type { Awaitable } from "@http/handler/types";
import type { Interceptors } from "@http/interceptor/types";

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
