import type { Code } from "./code-builder/mod.ts";
import type { GenerateOptions, GeneratorOptions } from "./types.ts";
import { generateRouteHandlersCode } from "./_generate_route_handlers_code.ts";

/**
 * Generate a route handler of static pre-built routes using
 * code generators prior to runtime.
 */
export default async function generateStaticRouteHandler(
  opts: GenerateOptions,
): Promise<Code> {
  const {
    moduleOutUrl,
    httpModulePrefix = "@http/",
    moduleImports,
    routerGenerator = import("./flat_router_generator.ts"),
  } = opts;

  const generatorOpts: GeneratorOptions = {
    moduleOutUrl,
    httpModulePrefix,
    moduleImports,
  };

  const routesCode = await generateRouteHandlersCode(opts);

  return (await routerGenerator).generate(routesCode, generatorOpts);
}
