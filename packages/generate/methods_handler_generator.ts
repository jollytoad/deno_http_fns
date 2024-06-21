import { hasMethodHandlers } from "@http/discovery/methods-handler-mapper";
import type { Code, GeneratorOptions, RouteModule } from "./types.ts";
import {
  asCodePattern,
  code,
  importAll,
  importNamed,
  literalOf,
  relativeModulePath,
} from "./code_builder.ts";

export const handlerMapper = "@http/discovery/methods-handler-mapper";

/**
 * Generate the code for route modules that export individual
 * method handling functions.
 */
export function generate(
  { pattern, module, loaded }: RouteModule,
  { moduleOutUrl, httpModulePrefix, moduleImports }: GeneratorOptions,
  i: number,
): Code | undefined {
  if (hasMethodHandlers(loaded)) {
    const byPattern = importNamed(
      `${httpModulePrefix}route/by-pattern`,
      "byPattern",
    );

    const byMethod = importNamed(
      `${httpModulePrefix}route/by-method`,
      "byMethod",
    );

    switch (moduleImports) {
      case "dynamic": {
        const lazy = importNamed(`${httpModulePrefix}route/lazy`, "lazy");

        return code`${byPattern}(${
          asCodePattern(pattern)
        }, ${lazy}(async () => ${byMethod}(await import(${
          literalOf(relativeModulePath(module, moduleOutUrl))
        }))))`;
      }

      case "static": {
        const routeModule = importAll(
          relativeModulePath(module, moduleOutUrl),
          `route_methods_${i}`,
        );

        return code`${byPattern}(${
          asCodePattern(pattern)
        }, ${byMethod}(${routeModule}))`;
      }
    }
  }
}
