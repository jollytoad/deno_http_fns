import { generateRoutesModule } from "@http/generate/generate-routes-module";

function generateRoutes(): Promise<boolean> {
  console.log("\n%cGenerating Routes...\n", "color: green; font-weight: bold;");
  return generateRoutesModule({
    pattern: "/",
    fileRootUrl: import.meta.resolve("../_routes"),
    moduleOutUrl: import.meta.resolve("../_routes.ts"),
    pathMapper: "@http/discovery/fresh-path-mapper",
    httpModulePrefix: "@http/",
    routeDiscovery: "static",
    moduleImports: "dynamic",
    verbose: true,
  });
}

export default generateRoutes;

if (import.meta.main) {
  await generateRoutes();
}
