import { discoverRoutes } from "https://deno.land/x/http_fns/lib/discover_routes.ts";
import freshPathMapper from "https://deno.land/x/http_fns/lib/fresh/path_mapper.ts";

console.log("\n%cDiscovering Routes...\n", "color: green; font-weight: bold;");

await discoverRoutes({
  pattern: "/",
  fileRootUrl: import.meta.resolve("../routes"),
  pathMapper: freshPathMapper,
  verbose: true,
});
