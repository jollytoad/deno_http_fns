import type { PathPattern, RoutePattern } from "@http/route/types";
export type { PathPattern, RoutePattern } from "@http/route/types";

/**
 * A result that may be `await`ed.
 */
export type Awaitable<T> = T | Promise<T>;

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
export interface DiscoveredPath {
  /**
   * The root of the path such as '/' or 'c:\'
   */
  root: string;
  /**
   * The full directory path of the parent such as '/home/user/dir' or 'c:\path\dir'
   */
  dir: string;
  /**
   * The file name including extension (if any) such as 'index.html'
   */
  base: string;
  /**
   * The file extension (if any) such as '.html'
   */
  ext: string;
  /**
   * The file name without extension (if any) such as 'index'
   */
  name: string;
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
}

/**
 * The filesystem directory scanning function.
 *
 * Signature is compatible with `Deno.readDir` and Node's `opendir`,
 * or a custom implementation can be supplied to `discoverRoutes`.
 */
export type DirectoryReader = (
  path: string,
) => Awaitable<Iterable<DirectoryEntry> | AsyncIterable<DirectoryEntry>>;

/**
 * Entries returned from a {@linkcode DirectoryReader}
 */
export interface DirectoryEntry {
  /**
   * Name of the file/directory relative to its parent
   */
  name: string;
  /**
   * Whether the entry is a directory
   */
  isDirectory?: boolean | (() => boolean);
  /**
   * Whether the entry is a file
   */
  isFile?: boolean | (() => boolean);
}
