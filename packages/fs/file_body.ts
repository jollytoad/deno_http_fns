import type { FileBodyFn } from "./types.ts";

/**
 * Create a Response body for a given file
 */
export const fileBody: FileBodyFn = "Deno" in globalThis
  ? (await import("./file_body_deno.ts")).default
  : "Bun" in globalThis
  ? (await import("./file_body_bun.ts")).default
  : () => {
    throw new Error("fileBody not supported on this runtime");
  };
