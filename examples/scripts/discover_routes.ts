import { discoverRoutes } from "@http/fns/discover_routes";
import freshPathMapper from "@http/fns/fresh/path_mapper";

console.log("\n%cDiscovering Routes...\n", "color: green; font-weight: bold;");

await discoverRoutes({
  pattern: "/",
  fileRootUrl: import.meta.resolve("../routes"),
  pathMapper: freshPathMapper,
  verbose: true,
});
