import type { StatFn } from "./types.ts";

/**
 * An appropriate file `stat` function for the runtime.
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
 * @param filePath the path to a file
 * @returns a Deno `FileInfo` or Node `Stats` object
 */
export const stat: StatFn =
  "Deno" in globalThis && typeof Deno.stat === "function"
    ? Deno.stat
    : (await import("node:fs/promises")).stat;
