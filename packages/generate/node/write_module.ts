import { fileURLToPath } from "node:url";
import { readFile, writeFile } from "node:fs/promises";

/**
 * Write a module, only if it differs from the existing file. (Node version)
 *
 * @param url path of the file as a URL
 * @param content the new content for the file
 * @returns whether the file was written
 */
export default async function writeModule(
  url: string | URL,
  content: string,
): Promise<boolean> {
  const path = fileURLToPath(url);

  let existingContent = undefined;

  try {
    existingContent = await readFile(path, { encoding: "utf-8" });
  } catch {
    // Ignore error
  }

  if (content !== existingContent) {
    console.debug("Writing new routes module:", path);
    await writeFile(path, content, { encoding: "utf-8" });
    return true;
  }

  return false;
}
