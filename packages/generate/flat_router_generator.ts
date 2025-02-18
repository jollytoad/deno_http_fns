import { asFn, type Code, importNamed, literal } from "./code-builder/mod.ts";
import type { GeneratorOptions } from "./types.ts";
import { asSerializablePattern } from "@http/discovery/as-serializable-pattern";
import type { DiscoveredRoute } from "@http/discovery/types";

/**
 * Generate a flat router, that attempts to match each route using `byPattern`,
 * and `cascade` to work through these handlers one by one until a match is found.
 */
export function generate(
  routesCode: Map<DiscoveredRoute, Code[]>,
  opts: GeneratorOptions,
): Code {
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

  const byPatternsCode = routesCode.entries().flatMap(([route, codes]) => {
    const codePattern = literal(asSerializablePattern(route.pattern));
    return codes.map((code) => byPattern(codePattern, code));
  });

  return cascade(...byPatternsCode);
}
