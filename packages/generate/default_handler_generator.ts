import { hasDefaultHandler } from "@http/discovery/default-handler-mapper";
import type { Code, GeneratorOptions, RouteModule } from "./types.ts";
import { importDefault } from "./code-builder/mod.ts";

export const handlerMapper = "@http/discovery/default-handler-mapper";

/**
 * Generate the code to for route modules that provide a request handler
 * as the default export.
 */
export function generate(
  { module, loaded }: RouteModule,
  {}: GeneratorOptions,
  i: number,
): Code | undefined {
  if (hasDefaultHandler(loaded)) {
    return importDefault(
      module,
      `route_${i}`,
    );
  }
}
