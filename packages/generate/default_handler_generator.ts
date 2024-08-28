import { hasDefaultHandler } from "@http/discovery/default-handler-mapper";
import type { Code, GeneratorOptions, RouteModule } from "./types.ts";
import {
  asCodePattern,
  asFn,
  dynamicImportAll,
  importDefault,
  importNamed,
  returnFromFn,
} from "./code-builder/mod.ts";

export const handlerMapper = "@http/discovery/default-handler-mapper";

/**
 * Generate the code to for route modules that provide a request handler
 * as the default export.
 */
export function generate(
  { pattern, module, loaded }: RouteModule,
  { httpModulePrefix, moduleImports }: GeneratorOptions,
  i: number,
): Code | undefined {
  if (hasDefaultHandler(loaded)) {
    const byPattern = asFn(importNamed(
      `${httpModulePrefix}route/by-pattern`,
      "byPattern",
    ));

    const codePattern = asCodePattern(pattern);

    switch (moduleImports) {
      case "dynamic": {
        const lazy = asFn(importNamed(`${httpModulePrefix}route/lazy`, "lazy"));
        const routeModule = dynamicImportAll(module);

        return byPattern(
          codePattern,
          lazy(returnFromFn(routeModule)),
        );
      }

      case "static": {
        const routeModule = importDefault(
          module,
          `route_${i}`,
        );

        return byPattern(codePattern, routeModule);
      }
    }
  }
}
