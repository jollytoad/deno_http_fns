import { generateRoutesModule } from "@http/fns/generate_routes_module.ts";

function generateRoutes() {
  console.log("\n%cGenerating Routes...\n", "color: green; font-weight: bold;");
  return generateRoutesModule({
    pattern: "/",
    fileRootUrl: import.meta.resolve("../routes"),
    moduleOutUrl: import.meta.resolve("../routes.ts"),
    pathMapper: "@http/fns/fresh/path_mapper.ts",
    httpFns: "@http/fns/",
    routeDiscovery: "static",
    moduleImports: "dynamic",
    verbose: true,
  });
}

export default generateRoutes;

if (import.meta.main) {
  await generateRoutes();
}
