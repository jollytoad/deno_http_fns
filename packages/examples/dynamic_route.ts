import { withFallback } from "@http/route/with-fallback";
import { dynamicRoute } from "@http/discovery/dynamic-route";
import freshPathMapper from "@http/discovery/fresh-path-mapper";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  withFallback(
    dynamicRoute({
      pattern: "/",
      fileRootUrl: import.meta.resolve("./_routes"),
      pathMapper: freshPathMapper,
      eagerness: "startup",
      verbose: true,
    }),
  ),
) as Deno.HttpServer;

export default server;
