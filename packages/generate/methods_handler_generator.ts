import { hasMethodHandlers } from "@http/discovery/methods-handler-mapper";
import type { Code, GeneratorOptions, RouteModule } from "./types.ts";
import {
  asFn,
  importAll,
  importNamed,
  staticImport,
} from "./code-builder/mod.ts";

export const handlerMapper = "@http/discovery/methods-handler-mapper";

/**
 * Generate the code for route modules that export individual
 * method handling functions.
 */
export function generate(
  { module, loaded }: RouteModule,
  { httpModulePrefix }: GeneratorOptions,
  i: number,
): Code | undefined {
  if (hasMethodHandlers(loaded)) {
    const byMethod = asFn(staticImport(importNamed(
      `${httpModulePrefix}route/by-method`,
      "byMethod",
    )));

    return byMethod(importAll(
      module,
      `route_methods_${i}`,
    ));
  }
}
