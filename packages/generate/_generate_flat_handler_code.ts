import { asFn, type Code, importNamed, literal } from "./code-builder/mod.ts";
import type { GenerateOptions } from "./types.ts";
import { generateRouteHandlersCode } from "./_generate_route_handlers_code.ts";
import { asSerializablePattern } from "@http/discovery/as-serializable-pattern";

/**
 * Generate a route handler of static pre-built routes using
 * code generators prior to runtime.
 */
export default async function generateFlatHandlerCode(
  opts: GenerateOptions,
): Promise<Code> {
  const {
    httpModulePrefix = "@http/",
  } = opts;

  const cascade = asFn(importNamed(
    `${httpModulePrefix}route/cascade`,
    "cascade",
  ));

  const byPattern = asFn(importNamed(
    `${httpModulePrefix}route/by-pattern`,
    "byPattern",
  ));

  const routesCode = await generateRouteHandlersCode(opts);

  const byPatternsCode = routesCode.entries().flatMap(([route, codes]) => {
    const codePattern = literal(asSerializablePattern(route.pattern));
    return codes.map((code) => byPattern(codePattern, code));
  });

  return cascade(...byPatternsCode);
}
