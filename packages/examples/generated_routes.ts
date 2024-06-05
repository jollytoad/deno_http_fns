import { withFallback } from "@http/route/with-fallback";
import routes from "./_routes.ts";
import generateRoutes from "./scripts/generate_routes.ts";
import { port } from "@http/host-deno-local/port";

await generateRoutes();

const server = Deno.serve(
  { port: port() },
  withFallback(routes),
) as Deno.HttpServer;

export default server;
