import { asFn, type Code, importNamed } from "./code-builder/mod.ts";
import type { GenerateOptions } from "./types.ts";
import { generateStaticRoutes } from "./_generate_static_routes.ts";

/**
 * Generate a route handler of static pre-built routes using
 * code generators prior to runtime.
 */
export async function generateStaticRoutesHandler(
  opts: GenerateOptions,
): Promise<Code> {
  const cascade = asFn(importNamed(
    `${opts.httpModulePrefix}route/cascade`,
    "cascade",
  ));

  return cascade(
    ...(await generateStaticRoutes(opts)).values().flatMap((code) => code),
  );
}
