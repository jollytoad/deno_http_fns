import { fromFileUrl } from "@std/path/from_file_url";
import { toFileUrl } from "@std/path/to_file_url";
import { join } from "@std/path/join";
import { parse } from "@std/path/parse";
import { asSerializablePattern } from "./as_serializable_pattern.ts";
import { asURLPatterns } from "./as_url_pattern.ts";
import type { PathPattern, RoutePattern } from "./types.ts";

type ParsedPath = ReturnType<typeof parse>;

/**
 * Options for the `discoverRoutes` function
 */
export interface DiscoverRoutesOptions {
  /**
   * The root URL path pattern under which all discovered routes are nested.
   * Defaults to '/'.
   */
  pattern?: PathPattern;
  /**
   * The root folder to walk in the filesystem as a `file:` URL.
   */
  fileRootUrl?: string | URL;
  /**
   * Function to transform a discovered path entry.
   */
  pathMapper?: PathMapper;
  /**
   * Function to mapper each file entry to zero, one or many routes.
   * The default mapping only maps typescript files.
   */
  routeMapper?: RouteMapper;
  /**
   * Function to compare two routes to determine ordering of the discovered routes.
   */
  compare?: RouteComparator;
  /**
   * Consolidate adjacent routes that have the same module specifier.
   */
  consolidate?: boolean;
  /**
   * Log all discovered routes.
   */
  verbose?: boolean;
}

/**
 * Function that maps a discovered path entry to zero, one or many routes.
 */
export type RouteMapper = (
  entry: DiscoveredPath,
) => Iterable<DiscoveredRoute> | AsyncIterable<DiscoveredRoute>;

/**
 * Function that transforms a discovered path entry.
 *
 * May be used to handle special case paths like 'index' files, and
 * transform one matching syntax (eg Fresh) to URLPattern syntax.
 */
export type PathMapper = (
  entry: DiscoveredPath,
) => DiscoveredPath;

/**
 * Compare two routes to determine ordering of the discovered routes.
 *
 * If `a` is a higher priority route than `b`, then this should return a negative number,
 * otherwise positive if lower, or zero if the priority is equal or indeterminate.
 *
 * Comparison maybe based on the pattern and/or the module of the route.
 */
export type RouteComparator = (
  a: ComparableRoute,
  b: ComparableRoute,
) => number;

/**
 * A discovered route, that associates one or more routes to a module specifier.
 */
export interface DiscoveredRoute {
  pattern: RoutePattern;
  module: string | URL;
}

/**
 * A simplified discovered route that associates a single URLPattern with a module specifier.
 */
export interface ComparableRoute {
  /**
   * A single route pattern represented as a URLPattern.
   */
  pattern: URLPattern;
  /**
   * This will always be a URL object if it's an absolute URL,
   * otherwise it will be a string if a relative URL or a bare specifier.
   */
  module: string | URL;
}

/**
 * A discovered file path, that may be a potential route.
 */
export type DiscoveredPath = ParsedPath & {
  /**
   * The parent URL path pattern of this entry
   */
  // parentPattern: PathPattern;
  /**
   * The parent filesystem path of this entry
   */
  parentPath: string;
  /**
   * The default module URL path pattern (ie. parentPattern + filename without extension),
   * the mapper fn may use this directly as the route, or provide an alternative.
   */
  pattern: PathPattern;
  /**
   * A default module URL for this entry (ie. file path url + filename with extension).
   * NOTE: This may not actually be an importable module, if the file type itself cannot
   * be imported by the JS engine. It's up to the mapper fn to determine this.
   */
  module: URL;
};

/**
 * Utility to walk the local filesystem and discover routes.
 *
 * @returns an array of discovered route tuples of the URLPattern to handler module URL.
 */
export async function discoverRoutes(
  opts?: DiscoverRoutesOptions,
): Promise<DiscoveredRoute[]> {
  const pathMapper: PathMapper = opts?.pathMapper ?? defaultPathMapper;
  const routeMapper: RouteMapper = opts?.routeMapper ?? defaultRouteMapper;
  const compare: RouteComparator = opts?.compare ?? defaultRouteCompare;

  const routes: ComparableRoute[] = [];

  const iter = walk(
    !opts?.pattern || opts?.pattern === "/" ? "" : opts?.pattern ?? "",
    opts?.fileRootUrl ? fromFileUrl(opts.fileRootUrl) : ".",
  );

  for await (const entry of iter) {
    for await (
      const { pattern, module: module_ } of routeMapper(pathMapper(entry))
    ) {
      const patterns = asURLPatterns(pattern);
      const module = asModule(module_);
      for (const pattern of patterns) {
        routes.push({ pattern, module });
      }
    }
  }

  routes.sort(compare);

  if (opts?.verbose) {
    for (const { pattern, module } of routes) {
      console.debug(
        `Found route: %c${asSerializablePattern(pattern)}%c -> %c${module}`,
        "color: yellow",
        "color: inherit",
        "color: cyan",
      );
    }
  }

  return opts?.consolidate ? consolidateRoutes(routes) : routes;
}

async function* walk(
  parentPattern: string,
  parentPath: string,
): AsyncIterable<DiscoveredPath> {
  for await (const entry of Deno.readDir(parentPath)) {
    if (entry.isDirectory) {
      yield* walk(
        `${parentPattern}/${entry.name}`,
        join(parentPath, entry.name),
      );
    } else {
      const parsedName = parse(entry.name);

      yield {
        parentPath,
        pattern: `${parentPattern}/${parsedName.name}`,
        module: toFileUrl(join(parentPath, parsedName.base)),
        ...parsedName,
      };
    }
  }
}

/**
 * Default path mapper function.
 *
 * Adjust 'index' entry patterns to be the parent path with optional trailing slash.
 */
export function defaultPathMapper(entry: DiscoveredPath): DiscoveredPath {
  if (entry.name === "index") {
    return {
      ...entry,
      pattern: entry.pattern === "/index"
        ? "/"
        : entry.pattern.replace(/\/index$/, "{/}?"),
    };
  }
  return entry;
}

/**
 * Default route mapper function.
 *
 * Maps only TypeScript (ts/tsx) modules.
 */
export function defaultRouteMapper(
  { ext, pattern, module }: DiscoveredPath,
): DiscoveredRoute[] {
  switch (ext) {
    case ".ts":
    case ".tsx":
      return [{
        pattern,
        module,
      }];
  }
  return [];
}

/**
 * Default route comparator function.
 *
 * Really dumb string comparison of the pathname of the URLPattern.
 */
export function defaultRouteCompare(
  { pattern: { pathname: a } }: ComparableRoute,
  { pattern: { pathname: b } }: ComparableRoute,
): number {
  // TODO: Sort using something like URLPattern.compareComponent if it becomes available
  // See: https://github.com/WICG/urlpattern/issues/61
  return a === b ? 0 : a > b ? -1 : 1;
}

/**
 * Consolidate adjacent routes that have the same module specifier,
 * into a single route with an array route pattern.
 */
function consolidateRoutes(routes: ComparableRoute[]): DiscoveredRoute[] {
  const consolidatedRoutes: DiscoveredRoute[] = [];

  let currentModule: string | undefined;
  let consolidatedPattern: URLPattern[] = [];

  function nextRoute(module?: string) {
    if (currentModule && consolidatedPattern.length > 0) {
      consolidatedRoutes.push({
        pattern: consolidatedPattern.length === 1
          ? consolidatedPattern[0]
          : consolidatedPattern,
        module: asModule(currentModule),
      });
    }
    currentModule = module;
    consolidatedPattern = [];
  }

  for (const { pattern, module } of routes) {
    const moduleStr = module.toString();

    if (moduleStr !== currentModule) {
      nextRoute(moduleStr);
    }

    consolidatedPattern.push(pattern);
  }

  nextRoute();

  return consolidatedRoutes;
}

/**
 * Convert a module specifier to a URL object if can be parsed.
 */
function asModule(module: string | URL): string | URL {
  return module instanceof URL
    ? module
    : URL.canParse(module)
    ? new URL(module)
    : module;
}
