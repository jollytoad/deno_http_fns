import { getAvailablePort } from "jsr:@std/net/get_available_port";

/**
 * Obtain a port for your http server.
 * If reading of env vars is permitted, it will check for a PORT var.
 */
export function port(preferredPort = 8000): number {
  if (
    Deno.permissions?.querySync?.({ name: "env", variable: "PORT" }).state ===
      "granted"
  ) {
    const p = Number.parseInt(Deno.env.get("PORT")!);
    if (Number.isSafeInteger(p) && p >= 1 && p <= 65535) {
      return p;
    }
  }
  return getAvailablePort({ preferredPort });
}
