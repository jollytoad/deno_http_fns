import type { Code, GeneratorOptions, RouteModule } from "@http/generate/types";
import {
  asCodePattern,
  code,
  importNamed,
  literalOf,
  relativeModulePath,
} from "@http/generate/code-builder";
import { hasBodyFunction } from "$test/generate/page_handler_mapper.ts";

export const handlerMapper = "$test/generate/page_handler_mapper.ts";

/**
 * An example custom code generator for route modules that export a
 * function named `body`. The static code generation equivalent of
 * the [example handler mapper](./page_handler_mapper.ts).
 */
export function generate(
  { pattern, module, loaded }: RouteModule,
  { moduleOutUrl, httpModulePrefix, moduleImports }: GeneratorOptions,
  i: number,
): Code | undefined {
  if (hasBodyFunction(loaded)) {
    const byPattern = importNamed(
      `${httpModulePrefix}route/by-pattern`,
      "byPattern",
    );

    const pageHandler = importNamed(
      `$test/generate/page_handler.ts`,
      "pageHandler",
    );

    switch (moduleImports) {
      case "dynamic": {
        const lazy = importNamed(`${httpModulePrefix}route/lazy`, "lazy");

        return code`${byPattern}(${
          asCodePattern(pattern)
        }, ${lazy}(async () => ${pageHandler}((await import(${
          literalOf(relativeModulePath(module, moduleOutUrl))
        })).body)))`;
      }

      case "static": {
        const routeModule = importNamed(
          relativeModulePath(module, moduleOutUrl),
          `page_body_${i}`,
          "body"
        );

        return code`${byPattern}(${asCodePattern(pattern)}, ${pageHandler}(${routeModule}))`;
      }
    }
  }
}
