import { discoverRoutes } from "@http/discovery/discover-routes";
import freshPathMapper from "@http/discovery/fresh-path-mapper";

console.log("\n%cDiscovering Routes...\n", "color: green; font-weight: bold;");

await discoverRoutes({
  pattern: "/",
  fileRootUrl: import.meta.resolve("../_routes"),
  pathMapper: freshPathMapper,
  verbose: true,
});
