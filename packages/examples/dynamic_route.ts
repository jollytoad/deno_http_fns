import { withFallback } from "@http/handler/with-fallback";
import { dynamicRoute } from "@http/discovery/dynamic-route";
import freshPathMapper from "@http/discovery/fresh-path-mapper";

const server = Deno.serve(withFallback(
  dynamicRoute({
    pattern: "/",
    fileRootUrl: import.meta.resolve("./_routes"),
    pathMapper: freshPathMapper,
    eagerness: "startup",
    verbose: true,
  }),
)) as Deno.HttpServer;

export default server;
