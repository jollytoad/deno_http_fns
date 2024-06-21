import { discoverRoutes } from "@http/discovery/discover-routes";
import { combinedRouteMapper } from "@http/discovery/combined-route-mapper";
import { dirname } from "@std/path/posix/dirname";
import { relative } from "@std/path/posix/relative";
import { fromFileUrl } from "@std/path/posix/from-file-url";
import { type Code, code, importNamed, joinCode } from "./code_builder.ts";
import type {
  GenerateOptions,
  GeneratorOptions,
  HandlerGeneratorModule,
  RouteModule,
} from "./types.ts";

/**
 * Generate a route handler of static pre-built routes using
 * code generators prior to runtime.
 */
export async function generateStaticRoutesHandler(
  opts: GenerateOptions,
): Promise<Code> {
  const cascade = importNamed(
    `${opts.httpModulePrefix}route/cascade`,
    "cascade",
  );

  return code`${cascade}(${
    joinCode(await generateStaticRoutes(opts), { on: "," })
  })`;
}

async function generateStaticRoutes(opts: GenerateOptions): Promise<Code[]> {
  const {
    pattern,
    fileRootUrl,
    moduleOutUrl,
    verbose,
    httpModulePrefix,
    moduleImports,
  } = opts;

  const outPath = dirname(fromFileUrl(moduleOutUrl));

  const pathMapper = opts.pathMapper
    ? (await import(opts.pathMapper.toString())).default
    : undefined;

  const routeMapper = opts.routeMapper
    ? Array.isArray(opts.routeMapper)
      ? combinedRouteMapper(
        ...await Promise.all(opts.routeMapper.map(async (routeMapper) =>
          (await import(routeMapper.toString())).default
        )),
      )
      : (await import(opts.routeMapper.toString())).default
    : undefined;

  const compare = opts.compare
    ? (await import(opts.compare.toString())).default
    : undefined;

  const routes = await discoverRoutes({
    pattern,
    fileRootUrl,
    pathMapper,
    routeMapper,
    compare,
    consolidate: true,
    verbose,
  });

  const routesCode: Code[] = [];

  let i = 1;

  for (const { pattern, module } of routes) {
    let modulePath = relative(outPath, fromFileUrl(module));
    if (modulePath[0] !== ".") {
      modulePath = "./" + modulePath;
    }

    const loaded = await import(String(module));

    const handlerGenerators = await Promise.all(
      opts.handlerGenerator
        ? Array.isArray(opts.handlerGenerator)
          ? opts.handlerGenerator
          : [opts.handlerGenerator]
        : [
          import("./default_handler_generator.ts"),
          import("./methods_handler_generator.ts"),
        ],
    ) as Partial<HandlerGeneratorModule>[];

    const routeModule: RouteModule = { pattern, module, loaded };
    const generatorOpts: GeneratorOptions = {
      moduleOutUrl,
      httpModulePrefix,
      moduleImports,
    };

    for (const { generate } of handlerGenerators) {
      const code = generate?.(routeModule, generatorOpts, i);

      if (code) {
        routesCode.push(code);
        i++;
        continue;
      }
    }
  }

  return routesCode;
}
