import { fromFileUrl } from "@std/path/from-file-url";
import { toFileUrl } from "@std/path/to-file-url";
import { join } from "@std/path/join";
import { parse } from "@std/path/parse";
import { asURLPatterns } from "@http/route/as-url-pattern";
import type {
  ComparableRoute,
  DirectoryReader,
  DiscoveredPath,
  DiscoveredRoute,
  PathMapper,
  PathPattern,
  RouteComparator,
  RouteMapper,
} from "./types.ts";
import { isDirectory, isFile } from "./_dir_entry.ts";

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
   * Function to map each file entry to zero, one or many routes.
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
   * Log all discovered routes to console.
   */
  verbose?: boolean;
  /**
   * Function to return directory entries.
   * Will default to `Deno.readDir` or Node's `opendir`.
   */
  readDir?: DirectoryReader;
}

/**
 * Utility to walk the local filesystem and discover routes.
 *
 * @example
 * ```ts
 * const routes = await discoverRoutes({
 *   pattern: "/",
 *   fileRootUrl: import.meta.resolve("./routes"),
 *   verbose: true,
 * });
 * ```
 *
 * @param opts configuration options
 * @returns an array of discovered route tuples of the URLPattern to handler module URL.
 */
export async function discoverRoutes(
  opts?: DiscoverRoutesOptions,
): Promise<DiscoveredRoute[]> {
  const pathMapper: PathMapper = opts?.pathMapper ??
    (await import("./index_path_mapper.ts")).default;

  const routeMapper: RouteMapper = opts?.routeMapper ??
    (await import("./ts_route_mapper.ts")).default;

  const compare: RouteComparator = opts?.compare ??
    (await import("./pathname_lexical_route_comparator.ts")).default;

  const readDir: DirectoryReader = opts?.readDir ??
    (await import("./_read_dir.ts")).default;

  const routes: ComparableRoute[] = [];

  const iter = walk(
    !opts?.pattern || opts?.pattern === "/" ? "" : opts?.pattern ?? "",
    opts?.fileRootUrl ? fromFileUrl(opts.fileRootUrl) : ".",
    readDir,
  );

  for await (const entry of iter) {
    for await (
      const discovered of routeMapper(pathMapper(entry))
    ) {
      if ("stop" in discovered && discovered.stop === true) {
        break;
      }
      if ("pattern" in discovered && "module" in discovered) {
        const patterns = asURLPatterns(discovered.pattern);
        const module = asModule(discovered.module);
        for (const pattern of patterns) {
          routes.push({ pattern, module });
        }
      }
    }
  }

  routes.sort(compare);

  if (opts?.verbose) {
    const { asSerializablePattern } = await import(
      "./as_serializable_pattern.ts"
    );
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
  readDir: DirectoryReader,
): AsyncIterable<DiscoveredPath> {
  for await (const entry of await readDir(parentPath)) {
    if (isDirectory(entry)) {
      yield* walk(
        `${parentPattern}/${entry.name}`,
        join(parentPath, entry.name),
        readDir,
      );
    } else if (isFile(entry)) {
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
        pattern: consolidatedPattern.length === 1 && consolidatedPattern[0]
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
 * Convert a module specifier to a URL object if it can be parsed.
 */
function asModule(module: string | URL): string | URL {
  return module instanceof URL
    ? module
    : URL.canParse(module)
    ? new URL(module)
    : module;
}
