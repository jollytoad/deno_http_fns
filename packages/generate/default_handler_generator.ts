import { hasDefaultHandler } from "@http/discovery/default-handler-mapper";
import type { Code, GeneratorOptions, RouteModule } from "./types.ts";
import {
  asCodePattern,
  code,
  importDefault,
  importNamed,
  literalOf,
  relativeModulePath,
} from "./code_builder.ts";

export const handlerMapper = "@http/discovery/default-handler-mapper";

/**
 * Generate the code to for route modules that provide a request handler
 * as the default export.
 */
export function generate(
  { pattern, module, loaded }: RouteModule,
  { moduleOutUrl, httpModulePrefix, moduleImports }: GeneratorOptions,
  i: number,
): Code | undefined {
  if (hasDefaultHandler(loaded)) {
    const byPattern = importNamed(
      `${httpModulePrefix}route/by-pattern`,
      "byPattern",
    );

    switch (moduleImports) {
      case "dynamic": {
        const lazy = importNamed(`${httpModulePrefix}route/lazy`, "lazy");

        return code`${byPattern}(${
          asCodePattern(pattern)
        }, ${lazy}(() => import(${
          literalOf(relativeModulePath(module, moduleOutUrl))
        })))`;
      }

      case "static": {
        const routeModule = importDefault(
          relativeModulePath(module, moduleOutUrl),
          `route_${i}`,
        );

        return code`${byPattern}(${asCodePattern(pattern)}, ${routeModule})`;
      }
    }
  }
}
