import { relative } from "@std/path/relative";
import { resolve } from "@std/path/resolve";

export const rootPath = import.meta.dirname
  ? resolve(import.meta.dirname, "..")
  : undefined;

export async function readJson(path: string) {
  try {
    return JSON.parse(await Deno.readTextFile(path));
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return undefined;
    } else {
      throw e;
    }
  }
}

export async function writeJson(path: string, content: unknown) {
  const newContent = JSON.stringify(content, null, 2) + "\n";
  const oldContent = JSON.stringify(await readJson(path), null, 2) + "\n";

  if (newContent !== oldContent) {
    await Deno.writeTextFile(path, newContent);
    console.log(`Updated: %c${relative(rootPath!, path)}`, "font-weight: bold");
    return true;
  }

  return false;
}

export interface DenoConfig {
  name?: string;
  version?: string;
  imports?: Record<string, string>;
  exports?: Record<string, string>;
  workspaces?: string[];
}

export async function readDenoConfig(
  parentPath = ".",
): Promise<DenoConfig | undefined> {
  if (rootPath) {
    const denoJsonPath = resolve(rootPath, parentPath, "deno.json");

    return await readJson(denoJsonPath) as DenoConfig;
  }

  return undefined;
}

export async function writeDenoConfig(
  content: DenoConfig,
  parentPath = ".",
): Promise<boolean> {
  if (rootPath) {
    const denoJsonPath = resolve(rootPath, parentPath, "deno.json");

    return await writeJson(denoJsonPath, content);
  }

  return false;
}

export function sortByKey<R extends Record<string, unknown>>(obj: R): R {
  return Object.fromEntries(
    Object.entries(obj).toSorted(([a], [b]) => a.localeCompare(b)),
  ) as R;
}
