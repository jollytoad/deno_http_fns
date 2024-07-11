import { ByteSliceStream } from "@std/streams/byte-slice-stream";
import type { FileBodyOptions } from "./types.ts";

/**
 * Create a Response body for a given file
 */
export async function fileBodyDeno(
  filePath: string,
  opts?: FileBodyOptions,
): Promise<BodyInit> {
  const { start = 0, end } = opts ?? {};
  const file = await Deno.open(filePath);

  if (start > 0) {
    await file.seek(start, Deno.SeekMode.Start);
  }

  if (end !== undefined) {
    return file.readable.pipeThrough(new ByteSliceStream(0, end - start));
  }

  return file.readable;
}

export default fileBodyDeno;
