import { staticRoute } from "@http/route-deno/static-route";
import { withFallback } from "@http/route/with-fallback";

const server = Deno.serve(withFallback(
  staticRoute("/", import.meta.resolve("./public"), { quiet: false }),
)) as Deno.HttpServer;

export default server;
