import { withFallback } from "@http/route/with-fallback";
import { intercept } from "@http/interceptor/intercept";
import { logging } from "@http/interceptor/logger";
import { type KeyAndCert, loadKeyAndCert } from "./load_key_and_cert.ts";
import type { Awaitable } from "@http/route/types";
import type { Interceptors } from "@http/interceptor/types";

export interface ServeOptions<S> extends Partial<KeyAndCert> {
  fetch(req: Request, server: S): Awaitable<Response>;
}

/**
 * Convenience function to generate Bun.serve init parameter for localhost dev mode.
 */
export default async function initLocalhost<S = unknown>(
  handler: (
    req: Request,
    server: S,
  ) => Awaitable<Response | null>,
  ...interceptors: Interceptors<unknown[], Response>[]
): Promise<ServeOptions<S>> {
  const keyAndCert = await loadKeyAndCert();
  return {
    fetch: intercept(withFallback(handler), logging(), ...interceptors),
    ...keyAndCert,
  };
}
