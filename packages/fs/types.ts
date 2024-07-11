/**
 * A result that may be `await`ed.
 */
export type Awaitable<T> = T | Promise<T>;

/**
 * Options for a {@linkcode FileBodyFn} function, eg. {@linkcode fileBody}
 */
export interface FileBodyOptions {
  /**
   * Offset from the start of the file to start body from
   */
  start?: number;

  /**
   * Offset from the start of the file at which to end the body
   */
  end?: number;
}

/**
 * Signature of a function that returns a Response body representing a file
 *
 * @returns the body for a a Response or undefined if not found or not readable
 */
export type FileBodyFn = (
  filePath: string,
  opts?: FileBodyOptions,
) => Promise<BodyInit | undefined>;

/**
 * Signature of the cross-runtime `stat` function
 */
export type StatFn = (path: string) => Promise<FileStats>;

/**
 * File stats interface compatible with Deno and Node
 *
 * This is the minimal amount of info we need for various http related functions
 */
export interface FileStats extends FileDesc {
  mtime: Date | null;

  atime: Date | null;

  size: number;
}

/**
 * File descriptor interface compatible with Deno and Node
 */
export interface FileDesc {
  /**
   * Whether the entry is a directory
   */
  isDirectory?: boolean | (() => boolean);
  /**
   * Whether the entry is a file
   */
  isFile?: boolean | (() => boolean);
}

/**
 * Options for {@linkcode serveDir}.
 */
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
