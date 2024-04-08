import {
  discoverRoutes,
  type DiscoverRoutesOptions,
} from "@http/discovery/discover-routes";
import { asSerializablePattern } from "@http/discovery/as-serializable-pattern";
import type { Eagerness } from "@http/discovery/dynamic-route";
import { dirname } from "@std/path/posix/dirname";
import { relative } from "@std/path/posix/relative";
import { fromFileUrl } from "@std/path/posix/from-file-url";

export interface GenerateOptions extends
  Omit<
    DiscoverRoutesOptions,
    "pathMapper" | "routeMapper" | "compare" | "consolidate"
  > {
  /**
   * The absolute path of the module to be generated, as a `file:` URL.
   */
  moduleOutUrl: string;

  /**
   * Whether to discover routes at build time and generate a static list or,
   * discover them dynamically at startup, or when the first request is made.
   * Defaults to `static`.
   */
  routeDiscovery?: "static" | "startup" | "request";

  /**
   * Whether to generate static imports or dynamic imports,
   * this only applies to 'static' route discovery.
   * Defaults to `dynamic`.
   */
  moduleImports?: "static" | "dynamic";

  /**
   * The prefix for http function modules.
   * Defaults to `@http/`, but you may want to change this to import
   * custom modules, or use `jsr:@http/` if you don't want to add it
   * to your import map.
   */
  httpModulePrefix?: string;

  /**
   * Module that supplies a PathMapper as the default function.
   */
  pathMapper?: string | URL;

  /**
   * Module that supplies a RouteMapper as the default function.
   */
  routeMapper?: string | URL;

  /**
   * Module that supplies a RouteComparator as the default function.
   */
  compare?: string | URL;
}

/**
 * Generate a TypeScript module that exports a routing handler as the default function.
 *
 * The generated code will vary depending on the options given.
 */
export async function generateRoutesModule({
  pattern,
  fileRootUrl,
  moduleOutUrl,
  routeDiscovery = "static",
  moduleImports = "dynamic",
  httpModulePrefix = "@http/",
  pathMapper,
  routeMapper,
  compare,
  verbose,
}: GenerateOptions): Promise<boolean> {
  assertIsFileUrl(fileRootUrl, "fileRootUrl");
  assertIsFileUrl(moduleOutUrl, "moduleOutUrl");

  const outUrl = new URL(moduleOutUrl);

  if (!await can("write", outUrl)) {
    // No permission to generate new module
    return false;
  }

  const outPath = dirname(outUrl.pathname);

  const httpFnImports = new Map<string, string>();
  const head: string[] = [];
  const body: string[] = [];
  let i = 1;

  switch (routeDiscovery) {
    case "startup":
    case "request":
      {
        httpFnImports.set("dynamicRoute", "discovery/dynamic-route");

        let modulePath = relative(
          outPath,
          fileRootUrl ? fromFileUrl(fileRootUrl) : Deno.cwd(),
        );
        if (modulePath[0] !== ".") {
          modulePath = "./" + modulePath;
        }

        const eagerness: Eagerness = routeDiscovery;

        body.push(`export default dynamicRoute({\n`);
        if (pattern !== undefined) {
          body.push(`  pattern: "${pattern}",\n`);
        }
        body.push(`  fileRootUrl: import.meta.resolve("${modulePath}"),\n`);
        body.push(`  eagerness: "${eagerness}",\n`);
        if (pathMapper) {
          head.push(`import pathMapper from "${pathMapper}";\n`);
          body.push(`  pathMapper,\n`);
        }
        if (routeMapper) {
          head.push(`import routeMapper from "${routeMapper}";\n`);
          body.push(`  routeMapper,\n`);
        }
        if (compare) {
          head.push(`import compare from "${compare}";\n`);
          body.push(`  compare,\n`);
        }
        if (verbose) {
          body.push(`  verbose: true,\n`);
        }
        body.push(`});\n`);
      }
      break;

    case "static":
    default: {
      const isLazy = moduleImports !== "static";

      httpFnImports.set("cascade", "route/cascade");

      body.push("export default cascade(\n");

      const routes = await discoverRoutes({
        pattern,
        fileRootUrl,
        pathMapper: pathMapper
          ? (await import(pathMapper.toString())).default
          : undefined,
        routeMapper: routeMapper
          ? (await import(routeMapper.toString())).default
          : undefined,
        compare: compare
          ? (await import(compare.toString())).default
          : undefined,
        consolidate: true,
        verbose,
      });

      for (const { pattern, module } of routes) {
        let modulePath = relative(outPath, fromFileUrl(module));
        if (modulePath[0] !== ".") {
          modulePath = "./" + modulePath;
        }

        const m = await import(String(module));

        const hasDefault = !!m.default;

        const patternJson = JSON.stringify(asSerializablePattern(pattern));

        httpFnImports.set("byPattern", "route/by-pattern");

        if (isLazy) {
          httpFnImports.set("lazy", "handler/lazy");
          if (hasDefault) {
            body.push(
              `  byPattern(${patternJson}, lazy(() => import("${modulePath}"))),\n`,
            );
          } else {
            httpFnImports.set("byMethod", "route/by-method");
            body.push(
              `  byPattern(${patternJson}, lazy(async () => byMethod(await import("${modulePath}")))),\n`,
            );
          }
        } else {
          if (hasDefault) {
            head.push(`import route_${i} from "${modulePath}";\n`);
            body.push(`  byPattern(${patternJson}, route_${i}),\n`);
          } else {
            httpFnImports.set("byMethod", "route/by-method");
            head.push(`import * as route_${i} from "${modulePath}";\n`);
            body.push(`  byPattern(${patternJson}, byMethod(route_${i})),\n`);
          }
        }

        i++;
      }

      body.push(`);\n`);
    }
  }

  for (const [fn, module] of httpFnImports.entries()) {
    head.unshift(`import { ${fn} } from "${httpModulePrefix}${module}";\n`);
  }

  head.unshift(
    "// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.\n\n",
  );

  head.push(`\n`);

  const content = head.concat(body).join("");

  let existingContent = undefined;

  if (await can("read", outUrl)) {
    try {
      existingContent = await Deno.readTextFile(outUrl);
    } catch {
      // Ignore error
    }
  }

  if (content !== existingContent) {
    console.debug("Writing new routes module:", outUrl.pathname);
    await Deno.writeTextFile(outUrl, content);
    return true;
  }

  return false;
}

async function can(
  name: "read" | "write",
  path: string | URL,
): Promise<boolean> {
  return (await Deno.permissions.query({ name, path })).state === "granted";
}

function assertIsFileUrl(
  url: string | URL | undefined,
  prop: string,
): void | never {
  if (!url || !URL.canParse(url) || new URL(url).protocol !== "file:") {
    throw new TypeError(
      `${prop} must be an absolute file URL, consider using 'import.meta.resolve'`,
    );
  }
}
