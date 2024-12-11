import { withFallback } from "@http/route/with-fallback";
import { intercept } from "@http/interceptor/intercept";
import { logging } from "@http/interceptor/logger";
import { port } from "./port.ts";
import { loadKeyAndCert } from "./load_key_and_cert.ts";
import { logServerUrl } from "./server_url.ts";
import type { Awaitable } from "@http/route/types";
import type { Interceptors } from "@http/interceptor/types";

/**
 * Convenience function to generate Deno.serve init parameter for localhost dev mode.
 */
export default async function initLocalhost(
  handler: (
    req: Request,
    info: Deno.ServeHandlerInfo<Deno.NetAddr>,
  ) => Awaitable<Response | null>,
  ...interceptors: Interceptors<unknown[], Response>[]
): Promise<
  & Deno.ServeInit<Deno.NetAddr>
  & (Deno.ServeTcpOptions | Deno.TlsCertifiedKeyPem)
> {
  const keyAndCert = await loadKeyAndCert();
  return {
    handler: intercept(withFallback(handler), logging(), ...interceptors),
    ...keyAndCert,
    hostname: "::",
    port: port(),
    onListen: logServerUrl(keyAndCert),
  };
}

Deno.serve;
