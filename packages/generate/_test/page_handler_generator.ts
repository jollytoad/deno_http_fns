import type { Code, GeneratorOptions, RouteModule } from "@http/generate/types";
import {
  asFn,
  importNamed,
  importResolve,
  staticImport,
} from "@http/generate/code-builder";
import { hasBodyFunction } from "$test/generate/page_handler_mapper.ts";

export const handlerMapper = "$test/generate/page_handler_mapper.ts";

/**
 * An example custom code generator for route modules that export a
 * function named `body`. The static code generation equivalent of
 * the [example handler mapper](./page_handler_mapper.ts).
 */
export function generate(
  { module, loaded }: RouteModule,
  {}: GeneratorOptions,
  i: number,
): Code | undefined {
  if (hasBodyFunction(loaded)) {

    const pageHandler = asFn(staticImport(importNamed(
      `$test/generate/page_handler.ts`,
      "pageHandler",
    )));

    const modulePath = importResolve(module);

    return pageHandler(importNamed(
      module,
      "body",
      `page_body_${i}`,
    ), modulePath);
  }
}
