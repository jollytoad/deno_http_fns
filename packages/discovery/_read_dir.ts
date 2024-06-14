import type { DirectoryReader } from "./types.ts";

/**
 * An appropriate `readDir` for the platform.
 */
const readDir: DirectoryReader =
  "Deno" in globalThis && typeof Deno.readDir === "function"
    ? Deno.readDir
    : (await import("node:fs/promises")).opendir;

export default readDir;
