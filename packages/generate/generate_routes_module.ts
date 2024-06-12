import {
  discoverRoutes,
  type DiscoverRoutesOptions,
} from "@http/discovery/discover-routes";
import { asSerializablePattern } from "@http/discovery/as-serializable-pattern";
import type {
  DynamicRouteOptions,
  Eagerness,
} from "@http/discovery/dynamic-route";
import { dirname } from "@std/path/posix/dirname";
import { relative } from "@std/path/posix/relative";
import { fromFileUrl } from "@std/path/posix/from-file-url";
import type { RoutePattern } from "@http/route/types";
import {
  type Code,
  code,
  importAll,
  importDefault,
  importNamed,
  joinCode,
  literalOf,
} from "./_code_builder.ts";

export interface GenerateOptions extends
  Omit<
    DiscoverRoutesOptions,
    "pathMapper" | "routeMapper" | "compare" | "consolidate"
  > {
  /**
   * The absolute path of the module to be generated, as a `file:` URL.
   */
  moduleOutUrl: string | URL;

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
export async function generateRoutesModule(
  opts: GenerateOptions,
): Promise<boolean> {
  const {
    fileRootUrl,
    moduleOutUrl,
    httpModulePrefix = "@http/",
  } = opts;

  assertIsFileUrl(fileRootUrl, "fileRootUrl");
  assertIsFileUrl(moduleOutUrl, "moduleOutUrl");

  if (!await can("write", moduleOutUrl)) {
    // No permission to generate new module
    return false;
  }

  const content = await generateRoutesModuleContent({
    ...opts,
    httpModulePrefix,
  });

  return writeIfDiff(moduleOutUrl, content);
}

/**
 * Generate routes module content.
 */
export async function generateRoutesModuleContent(
  opts: GenerateOptions,
): Promise<string> {
  const {
    httpModulePrefix = "@http/",
  } = opts;

  const handlerCode = await generateHandler({ ...opts, httpModulePrefix });
  const moduleCode = code`export default ${handlerCode}`;

  return moduleCode.toString({
    prefix:
      "// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.\n",
  });
}

async function writeIfDiff(url: string | URL, content: string) {
  const path = fromFileUrl(url);

  let existingContent = undefined;

  if (await can("read", path)) {
    try {
      existingContent = await Deno.readTextFile(path);
    } catch {
      // Ignore error
    }
  }

  if (content !== existingContent) {
    console.debug("Writing new routes module:", path);
    await Deno.writeTextFile(path, content);
    return true;
  }

  return false;
}

function relativeModulePath(from: string, to: string): string {
  let modulePath = relative(from, to);
  if (modulePath[0] !== ".") {
    modulePath = "./" + modulePath;
  }
  return modulePath;
}

function generateHandler(opts: GenerateOptions): Code | Promise<Code> {
  switch (opts.routeDiscovery) {
    case "startup":
    case "request":
      return generateDynamicRouteHandler(opts as GenerateDynamicRouteOptions);

    case "static":
    default:
      return generateStaticRoutesHandler(opts);
  }
}

type GenerateDynamicRouteOptions = GenerateOptions & {
  routeDiscovery: Eagerness;
};

function generateDynamicRouteHandler(opts: GenerateDynamicRouteOptions): Code {
  const outPath = dirname(fromFileUrl(opts.moduleOutUrl));

  const dynamicRoute = importNamed(
    `${opts.httpModulePrefix}discovery/dynamic-route`,
    "dynamicRoute",
  );

  const modulePath = relativeModulePath(
    outPath,
    opts.fileRootUrl ? fromFileUrl(opts.fileRootUrl) : Deno.cwd(),
  );

  const optsCode: Partial<Record<keyof DynamicRouteOptions, unknown>> = {
    ...(opts.pattern !== undefined
      ? { pattern: literalOf(opts.pattern) }
      : null),
    fileRootUrl: code`import.meta.resolve(${literalOf(modulePath)})`,
    eagerness: opts.routeDiscovery,
    ...(opts.pathMapper
      ? { pathMapper: importDefault(opts.pathMapper, "pathMapper") }
      : null),
    ...(opts.routeMapper
      ? { routeMapper: importDefault(opts.routeMapper, "routeMapper") }
      : null),
    ...(opts.compare
      ? { compare: importDefault(opts.compare, "compare") }
      : null),
    consolidate: true,
    ...(opts.verbose ? { verbose: opts.verbose } : null),
  };

  return code`${dynamicRoute}(${optsCode})`;
}

async function generateStaticRoutesHandler(
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
  const outPath = dirname(fromFileUrl(opts.moduleOutUrl));

  const isLazy = opts.moduleImports !== "static";

  const byPattern = importNamed(
    `${opts.httpModulePrefix}route/by-pattern`,
    "byPattern",
  );
  const byMethod = importNamed(
    `${opts.httpModulePrefix}route/by-method`,
    "byMethod",
  );
  const lazy = importNamed(`${opts.httpModulePrefix}route/lazy`, "lazy");

  const routesCode: Code[] = [];

  const routes = await discoverRoutes({
    pattern: opts.pattern,
    fileRootUrl: opts.fileRootUrl,
    pathMapper: opts.pathMapper
      ? (await import(opts.pathMapper.toString())).default
      : undefined,
    routeMapper: opts.routeMapper
      ? (await import(opts.routeMapper.toString())).default
      : undefined,
    compare: opts.compare
      ? (await import(opts.compare.toString())).default
      : undefined,
    consolidate: true,
    verbose: opts.verbose,
  });

  let i = 1;

  for (const { pattern, module } of routes) {
    let modulePath = relative(outPath, fromFileUrl(module));
    if (modulePath[0] !== ".") {
      modulePath = "./" + modulePath;
    }

    const m = await import(String(module));

    const hasDefault = !!m.default;

    const patternCode = asCodePattern(pattern);

    if (isLazy) {
      if (hasDefault) {
        routesCode.push(
          code`${byPattern}(${patternCode}, ${lazy}(() => import(${
            literalOf(modulePath)
          })))`,
        );
      } else {
        routesCode.push(
          code`${byPattern}(${patternCode}, ${lazy}(async () => ${byMethod}(await import(${
            literalOf(modulePath)
          }))))`,
        );
      }
    } else {
      if (hasDefault) {
        const routeModule = importDefault(modulePath, `route_${i}`);
        routesCode.push(code`${byPattern}(${patternCode}, ${routeModule})`);
      } else {
        const routeModule = importAll(modulePath, `route_${i}`);
        routesCode.push(
          code`${byPattern}(${patternCode}, ${byMethod}(${routeModule}))`,
        );
      }
    }

    i++;
  }

  return routesCode;
}

function asCodePattern(pattern: RoutePattern) {
  const serializablePattern = asSerializablePattern(pattern);
  if (
    typeof serializablePattern === "string" ||
    Array.isArray(serializablePattern)
  ) {
    return literalOf(serializablePattern);
  } else {
    return serializablePattern;
  }
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
