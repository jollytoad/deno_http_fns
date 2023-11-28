import { generateRoutesModule } from "https://deno.land/x/http_fns/lib/generate_routes_module.ts";

function generateRoutes() {
  console.log("\n%cGenerating Routes...\n", "color: green; font-weight: bold;");
  return generateRoutesModule({
    pattern: "/",
    fileRootUrl: import.meta.resolve("../routes"),
    moduleOutUrl: import.meta.resolve("../routes.ts"),
    pathMapper: "https://deno.land/x/http_fns/fresh/path_mapper.ts",
    httpFns: "https://deno.land/x/http_fns/",
    routeDiscovery: "static",
    moduleImports: "dynamic",
    verbose: true,
  });
}

export default generateRoutes;

if (import.meta.main) {
  await generateRoutes();
}
