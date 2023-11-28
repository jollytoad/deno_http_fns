import { withFallback } from "https://deno.land/x/http_fns/lib/with_fallback.ts";
import routes from "./routes.ts";
import generateRoutes from "./scripts/generate_routes.ts";

await generateRoutes();

Deno.serve(withFallback(routes));
