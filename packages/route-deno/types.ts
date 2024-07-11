/**
 * A result that may be `await`ed.
 */
export type Awaitable<T> = T | Promise<T>;

/** Interface for serveDir options. */
export interface ServeDirOptions {
  /** Serves the files under the given directory root. Defaults to your current directory.
   *
   * @default {"."}
   */
  fsRoot?: string;

  /** Specified that part is stripped from the beginning of the requested pathname.
   *
   * @default {undefined}
   */
  urlRoot?: string;

  /** Serves `index.html` as the index file of the directory.
   *
   * @default {true}
   */
  showIndex?: boolean;

  /** The algorithm to use for generating the ETag.
   *
   * @default {"SHA-256"}
   */
  etagAlgorithm?: AlgorithmIdentifier;

  /** A default ETag value to fallback on if the file has no mtime */
  etagDefault?: string | Promise<string | undefined>;
}

/**
 * Options for creating a static route handler.
 */
export type StaticRouteOptions = Omit<ServeDirOptions, "fsRoot" | "urlRoot">;
