import { hasMethodHandlers } from "@http/discovery/methods-handler-mapper";
import type { Code, GeneratorOptions, RouteModule } from "./types.ts";
import {
  asCodePattern,
  asFn,
  awaitImportAll,
  importAll,
  importNamed,
  returnFromFn,
} from "./code-builder/mod.ts";

export const handlerMapper = "@http/discovery/methods-handler-mapper";

/**
 * Generate the code for route modules that export individual
 * method handling functions.
 */
export function generate(
  { pattern, module, loaded }: RouteModule,
  { httpModulePrefix, moduleImports }: GeneratorOptions,
  i: number,
): Code | undefined {
  if (hasMethodHandlers(loaded)) {
    const byPattern = asFn(importNamed(
      `${httpModulePrefix}route/by-pattern`,
      "byPattern",
    ));

    const byMethod = asFn(importNamed(
      `${httpModulePrefix}route/by-method`,
      "byMethod",
    ));

    const codePattern = asCodePattern(pattern);

    switch (moduleImports) {
      case "dynamic": {
        const lazy = asFn(importNamed(`${httpModulePrefix}route/lazy`, "lazy"));
        const routeModule = awaitImportAll(module);

        return byPattern(
          codePattern,
          lazy(returnFromFn(byMethod(routeModule))),
        );
      }

      case "static": {
        const routeModule = importAll(
          module,
          `route_methods_${i}`,
        );

        return byPattern(codePattern, byMethod(routeModule));
      }
    }
  }
}
