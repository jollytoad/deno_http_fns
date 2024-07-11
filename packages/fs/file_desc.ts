import type { FileDesc } from "./types.ts";

export type { FileDesc };

/**
 * Does the given file descriptor represent a directory?
 *
 * @example
 * ```ts
 * import { stat } from "jsr:@http/fs/stat";
 * import { isDirectory } from "jsr:@http/fs/file-desc";
 *
 * const fileInfo = await stat("./foo");
 *
 * if (isDirectory(fileInfo)) {
 *   ...
 * }
 * ```
 *
 * @param entry may be a Deno `FileInfo`, or Node `Stats` object
 */
export function isDirectory(entry: FileDesc): boolean {
  return typeof entry.isDirectory === "function"
    ? entry.isDirectory()
    : !!entry.isDirectory;
}

/**
 * Does the given file descriptor represent a regular file?
 *
 * @example
 * ```ts
 * import { stat } from "jsr:@http/fs/stat";
 * import { isFile } from "jsr:@http/fs/file-desc";
 *
 * const fileInfo = await stat("./foo");
 *
 * if (isFile(fileInfo)) {
 *   ...
 * }
 * ```
 *
 * @param entry may be a Deno `FileInfo`, or Node `Stats` object
 */
export function isFile(entry: FileDesc): boolean {
  return typeof entry.isFile === "function" ? entry.isFile() : !!entry.isFile;
}
