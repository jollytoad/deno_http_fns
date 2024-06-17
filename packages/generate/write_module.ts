/**
 * Write a module, only if it differs from the existing file.
 *
 * @param url path of the file as a URL
 * @param content the new content for the file
 * @returns whether the file was written
 */
export const writeModule: (
  url: string | URL,
  content: string,
) => Promise<boolean> = "Deno" in globalThis
  ? (await import("./deno/write_module.ts")).default
  : (await import("./node/write_module.ts")).default;

export default writeModule;
