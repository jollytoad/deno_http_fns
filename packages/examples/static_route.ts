import { staticRoute } from "@http/route-deno/static-route";
import { withFallback } from "@http/route/with-fallback";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  withFallback(
    staticRoute("/", import.meta.resolve("./public"), { quiet: false }),
  ),
) as Deno.HttpServer;

export default server;
