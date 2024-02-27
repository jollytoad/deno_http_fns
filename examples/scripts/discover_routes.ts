import { discoverRoutes } from "@http/fns/discover_routes.ts";
import freshPathMapper from "@http/fns/fresh/path_mapper.ts";

console.log("\n%cDiscovering Routes...\n", "color: green; font-weight: bold;");

await discoverRoutes({
  pattern: "/",
  fileRootUrl: import.meta.resolve("../routes"),
  pathMapper: freshPathMapper,
  verbose: true,
});
