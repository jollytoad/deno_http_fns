export async function stat(
  filePath: string,
): Promise<Deno.FileInfo | undefined> {
  try {
    return await Deno.stat(filePath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return undefined;
    } else {
      throw error;
    }
  }
}

export async function openFileStream(
  filePath: string,
  start = 0,
): Promise<ReadableStream<Uint8Array>> {
  const file = await Deno.open(filePath);
  if (start > 0) {
    await file.seek(start, Deno.SeekMode.Start);
  }
  return file.readable;
}
