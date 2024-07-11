/// <reference types="npm:bun-types@^1.1.6" />

import type { FileBodyOptions } from "./types.ts";

/**
 * Create a Response body for a given file
 */
export function fileBodyBun(
  filePath: string,
  opts?: FileBodyOptions,
): Promise<BodyInit> {
  const { start = 0, end } = opts ?? {};

  let file = Bun.file(filePath);

  if (start > 0 || end !== undefined) {
    file = file.slice(start, end);
  }

  return Promise.resolve(file.stream() as ReadableStream<Uint8Array>);
}

export default fileBodyBun;
