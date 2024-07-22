import type { FileBodyOptions } from "./types.ts";

interface Bun {
  file(path: string): Blob;
}

/**
 * Create a Response body for a given file
 */
export function fileBodyBun(
  filePath: string,
  opts?: FileBodyOptions,
): Promise<BodyInit> {
  const { start = 0, end } = opts ?? {};

  const { Bun } = globalThis as typeof globalThis & { Bun: Bun };
  let file = Bun.file(filePath);

  if (start > 0 || end !== undefined) {
    file = file.slice(start, end);
  }

  return Promise.resolve(file.stream());
}

export default fileBodyBun;
