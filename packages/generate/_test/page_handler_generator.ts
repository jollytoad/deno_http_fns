import type { Code, GeneratorOptions, RouteModule } from "@http/generate/types";
import {
  asCodePattern,
  asFn,
  awaitImportNamed,
  importNamed,
  returnFromFn,
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
  { httpModulePrefix, moduleImports }: GeneratorOptions,
  i: number,
): Code | undefined {
  if (hasBodyFunction(loaded)) {
    const byPattern = asFn(importNamed(
      `${httpModulePrefix}route/by-pattern`,
      "byPattern",
    ));

    const pageHandler = asFn(importNamed(
      `$test/generate/page_handler.ts`,
      "pageHandler",
    ));

    const codePattern = asCodePattern(pattern);

    switch (moduleImports) {
      case "dynamic": {
        const lazy = asFn(importNamed(`${httpModulePrefix}route/lazy`, "lazy"));
        const body = awaitImportNamed(module, "body");

        return byPattern(codePattern, lazy(returnFromFn(pageHandler(body))));
      }

      case "static": {
        const routeModule = importNamed(
          module,
          "body",
          `page_body_${i}`,
        );

        return byPattern(codePattern, pageHandler(routeModule));
      }
    }
  }
}
