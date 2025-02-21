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
  etagAlgorithm?: AlgorithmIdentifier | undefined;

  /** A default ETag value to fallback on if the file has no mtime */
  etagDefault?: Awaitable<string | undefined>;

  /**
   * Override the default file extension to content-type header function.
   * Defaults to [`@std/media-types/contentType`](https://jsr.io/@std/media-types/doc/~/contentType).
   *
   * This function only needs to handle lowercase file-extensions with a `.` prefix
   * (eg: `.html`, `.js`, `.ts`), and return a complete `Content-Type` header.
   *
   * NOTE: although it uses `contentType` from `@std/media-types`, it does not need to be
   * compatible with it's behaviour of also accepting media type strings.
   *
   * It may also return `undefined`, in which case we'll fallback to using the
   * default `@std/media-types/contentType` function.
   */
  contentType?: (ext: string) => string | undefined;
}
