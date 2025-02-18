import { dirname } from "@std/path/posix/dirname";
import { relative } from "@std/path/posix/relative";
import { fromFileUrl } from "@std/path/posix/from-file-url";
import {
  asFn,
  type Code,
  dynamicImport,
  importNamed,
} from "./code-builder/mod.ts";
import type {
  GenerateOptions,
  GeneratorOptions,
  HandlerGeneratorModule,
  RouteModule,
} from "./types.ts";
import { discoverRoutesForGen } from "./_discover_routes_for_gen.ts";
import type { DiscoveredRoute } from "@http/discovery/types";

/**
 * Generate the handler(s) code for each discovered route.
 *
 * The code of each handler does not attempt to match the request URL for the route,
 * that must be added by the consumer of this function, allowing alternative strategies
 * for the actual routing (eg. a flat router using cascade/byPattern, or a tree router
 * using byPathTree/byPattern, or some other most advance/performant strategy).
 */
export async function generateRouteHandlersCode(
  opts: GenerateOptions,
): Promise<Map<DiscoveredRoute, Code[]>> {
  const {
    moduleOutUrl,
    httpModulePrefix = "@http/",
    moduleImports = "dynamic",
  } = opts;

  const outPath = dirname(fromFileUrl(moduleOutUrl));

  const routes = await discoverRoutesForGen(opts);

  const routesCode: Map<DiscoveredRoute, Code[]> = new Map();

  let i = 1;

  for (const route of routes) {
    const { pattern, module } = route;

    const routeCode: Code[] = [];

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

    const lazy = asFn(importNamed(`${httpModulePrefix}route/lazy`, "lazy"));

    for (const { generate } of handlerGenerators) {
      let code = generate?.(routeModule, generatorOpts, i);

      if (code) {
        if (moduleImports === "dynamic") {
          code.imports?.forEach(dynamicImport);
        }

        if (code.returnsPromise?.()) {
          code = lazy(returnFromFn(code));
        }

        routeCode.push(code);

        i++;
        continue;
      }
    }

    routesCode.set(route, routeCode);
  }

  return routesCode;
}

function returnFromFn(code: Code): Code {
  return {
    imports: code.imports,
    toString() {
      return (code.hasAwaits?.() ? "async " : "") + `() => ${code}`;
    },
  };
}
