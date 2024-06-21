import type { DynamicRouteOptions } from "@http/discovery/dynamic-route";
import {
  type Code,
  code,
  importDefault,
  importNamed,
  joinCode,
  literalOf,
  relativeModulePath,
} from "./code_builder.ts";
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
  const dynamicRoute = importNamed(
    `${opts.httpModulePrefix}discovery/dynamic-route`,
    "dynamicRoute",
  );

  const fileRootUrl = code`import.meta.resolve(${
    literalOf(relativeModulePath(opts.fileRootUrl, opts.moduleOutUrl))
  })`;

  const pattern = opts.pattern !== undefined
    ? literalOf(opts.pattern)
    : undefined;

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

  return code`${dynamicRoute}(${optsCode})`;
}

function cascadeHandlerMappers(
  opts: GenerateDynamicRouteOptions,
  handlerGenerators: Array<HandlerGeneratorModule>,
) {
  const cascadingHandlerMapper = importNamed(
    `${opts.httpModulePrefix}discovery/cascading-handler-mapper`,
    "cascadingHandlerMapper",
  );

  return code`${cascadingHandlerMapper}(${
    joinCode(
      handlerGenerators.map(({ handlerMapper }, i) =>
        code`${importDefault(handlerMapper, `handlerMapper_${i + 1}`)}`
      ),
      { on: "," },
    )
  })`;
}

function combineRouteMappers(
  opts: GenerateDynamicRouteOptions,
  routeMappers: Array<string | URL>,
) {
  const combinedRouteMapper = importNamed(
    `${opts.httpModulePrefix}discovery/combined-route-mapper`,
    "combinedRouteMapper",
  );

  return code`${combinedRouteMapper}(${
    joinCode(
      routeMappers.map((mapper, i) =>
        code`${importDefault(mapper, `routeMapper_${i + 1}`)}`
      ),
      { on: "," },
    )
  })`;
}
