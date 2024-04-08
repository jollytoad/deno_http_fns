import { withFallback } from "@http/handler/with-fallback";
import routes from "./_routes.ts";
import generateRoutes from "./scripts/generate_routes.ts";

await generateRoutes();

const server = Deno.serve(withFallback(routes)) as Deno.HttpServer;

export default server;
