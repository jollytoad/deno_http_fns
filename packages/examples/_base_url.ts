import { getServerUrl } from "@http/host-deno-local/server-url";

export function getBaseUrl(server: Deno.HttpServer<Deno.Addr>) {
  if (server.addr.transport !== "tcp") {
    throw new Error("Server is not listening on a tcp connection!");
  }
  return getServerUrl(server.addr.hostname, server.addr.port);
}
