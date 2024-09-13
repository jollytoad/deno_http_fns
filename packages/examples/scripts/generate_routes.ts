#!/usr/bin/env -S deno run --allow-ffi --allow-read=. --allow-write=. --allow-net=jsr.io

/**
 * This is an example script to generate a static routes module using
 * {@linkcode generateRoutesModule}.
 *
 * This can be executed directly as script, or added as deno task,
 * or imported into a dev server and called before the server is
 * started (see the [generated-routes](../generated_routes.ts) example).
 *
 * This example needs access to the filesystem.
 * So, unlike other examples, it cannot be run directly from JSR.
 *
 * If you checkout this repo with git though, you can run it from
 * the local filesystem:
 *
 * ```sh
 * rm ./packages/examples/_routes.ts
 * deno task example:gen
 * ```
 *
 * Then take a look at the generated `./packages/examples/_routes.ts` file.
 *
 * @module
 */

import { generateRoutesModule } from "@http/generate/generate-routes-module";
import { dprintFormatModule } from "@http/generate/dprint-format-module";

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
    formatModule: dprintFormatModule(),
    verbose: true,
  });
}

export default generateRoutes;

if (import.meta.main) {
  await generateRoutes();
}
