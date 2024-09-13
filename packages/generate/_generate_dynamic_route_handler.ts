import type { DynamicRouteOptions } from "@http/discovery/dynamic-route";
import {
  asFn,
  type Code,
  importDefault,
  importNamed,
  importResolve,
  literal,
} from "./code-builder/mod.ts";
import type {
  GenerateDynamicRouteOptions,
  HandlerGeneratorModule,
} from "./types.ts";

/**
 * Generate a route handler that uses `dynamicRoute` to discovered and
 * construct the filesystem router at runtime.
 */
export async function generateDynamicRouteHandler(
  opts: GenerateDynamicRouteOptions,
): Promise<Code> {
  const dynamicRoute = asFn(importNamed(
    `${opts.httpModulePrefix}discovery/dynamic-route`,
    "dynamicRoute",
  ));

  const fileRootUrl = importResolve(opts.fileRootUrl);

  const pattern = opts.pattern !== undefined ? opts.pattern : undefined;

  const pathMapper = opts.pathMapper
    ? importDefault(opts.pathMapper, "pathMapper")
    : undefined;

  const routeMapper = opts.routeMapper
    ? Array.isArray(opts.routeMapper)
      ? combineRouteMappers(opts, opts.routeMapper)
      : importDefault(opts.routeMapper, "routeMapper")
    : undefined;

  const handlerMapper = opts.handlerGenerator
    ? Array.isArray(opts.handlerGenerator)
      ? cascadeHandlerMappers(opts, await Promise.all(opts.handlerGenerator))
      : importDefault(
        (await opts.handlerGenerator).handlerMapper,
        "handlerMapper",
      )
    : undefined;

  const compare = opts.compare
    ? importDefault(opts.compare, "compare")
    : undefined;

  const { routeDiscovery: eagerness, verbose } = opts;

  const optsCode: Partial<Record<keyof DynamicRouteOptions, unknown>> = {
    ...(pattern ? { pattern } : null),
    fileRootUrl,
    eagerness,
    ...(pathMapper ? { pathMapper } : null),
    ...(routeMapper ? { routeMapper } : null),
    ...(handlerMapper ? { handlerMapper } : null),
    ...(compare ? { compare } : null),
    consolidate: true,
    ...(verbose ? { verbose } : null),
  };

  return dynamicRoute(literal(optsCode));
}

function cascadeHandlerMappers(
  opts: GenerateDynamicRouteOptions,
  handlerGenerators: Array<HandlerGeneratorModule>,
) {
  const cascadingHandlerMapper = asFn(importNamed(
    `${opts.httpModulePrefix}discovery/cascading-handler-mapper`,
    "cascadingHandlerMapper",
  ));

  return cascadingHandlerMapper(
    ...handlerGenerators.map(({ handlerMapper }, i) =>
      importDefault(handlerMapper, `handlerMapper_${i + 1}`)
    ),
  );
}

function combineRouteMappers(
  opts: GenerateDynamicRouteOptions,
  routeMappers: Array<string | URL>,
) {
  const combinedRouteMapper = asFn(importNamed(
    `${opts.httpModulePrefix}discovery/combined-route-mapper`,
    "combinedRouteMapper",
  ));

  return combinedRouteMapper(
    ...routeMappers.map((mapper, i) =>
      importDefault(mapper, `routeMapper_${i + 1}`)
    ),
  );
}
