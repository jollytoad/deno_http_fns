import { fromFileUrl } from "@std/path/from-file-url";

/**
 * Write a module, only if it differs from the existing file. (Deno version)
 *
 * @param url path of the file as a URL
 * @param content the new content for the file
 * @returns whether the file was written
 */
export default async function writeModule(
  url: string | URL,
  content: string,
): Promise<boolean> {
  const path = fromFileUrl(url);

  let existingContent = undefined;

  try {
    existingContent = await Deno.readTextFile(path);
  } catch {
    // Ignore error
  }

  if (content !== existingContent) {
    console.debug("Writing new routes module:", path);
    await Deno.writeTextFile(path, content);
    return true;
  }

  return false;
}
