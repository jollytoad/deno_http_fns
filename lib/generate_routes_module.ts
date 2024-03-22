import {
  discoverRoutes,
  type DiscoverRoutesOptions,
} from "./discover_routes.ts";
import { asSerializablePattern } from "./as_serializable_pattern.ts";
import type { Eagerness } from "./dynamic_route.ts";
import { dirname } from "@std/path/posix/dirname";
import { relative } from "@std/path/posix/relative";
import { fromFileUrl } from "@std/path/posix/from_file_url";

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
   * The base module specifier for the 'http_fns' imports.
   * Defaults to a resolved URL relative to this module,
   * but you may prefer to supply a bare module specifier
   * as declared in your import map instead.
   * Example: "$http_fns/"
   */
  httpFns?: string | URL;

  /**
   * Should we assume http fns are imported from JSR.
   */
  jsr?: boolean;

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
  httpFns,
  jsr,
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

  const httpFnsUrl = httpFns ?? new URL("./", import.meta.url).href;
  const outPath = dirname(outUrl.pathname);
  const ext = jsr ? "" : ".ts";

  const httpFnImports = new Map<string, string>();
  const head: string[] = [];
  const body: string[] = [];
  let i = 1;

  switch (routeDiscovery) {
    case "startup":
    case "request":
      {
        httpFnImports.set("dynamicRoute", "dynamic_route");

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

      httpFnImports.set("cascade", "cascade");

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

        httpFnImports.set("byPattern", "by_pattern");

        if (isLazy) {
          httpFnImports.set("lazy", "lazy");
          if (hasDefault) {
            body.push(
              `  byPattern(${patternJson}, lazy(() => import("${modulePath}"))),\n`,
            );
          } else {
            httpFnImports.set("byMethod", "by_method");
            body.push(
              `  byPattern(${patternJson}, lazy(async () => byMethod(await import("${modulePath}")))),\n`,
            );
          }
        } else {
          if (hasDefault) {
            head.push(`import route_${i} from "${modulePath}";\n`);
            body.push(`  byPattern(${patternJson}, route_${i}),\n`);
          } else {
            httpFnImports.set("byMethod", "by_method");
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
    head.unshift(`import { ${fn} } from "${httpFnsUrl}${module}${ext}";\n`);
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
