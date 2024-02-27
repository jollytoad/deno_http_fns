import { resolve } from "jsr:@std/path@0.217/resolve";
import { join } from "jsr:@std/path@0.217/join";
import { join as posixJoin } from "jsr:@std/path@0.217/posix/join";
import { parse as posixParse } from "jsr:@std/path@0.217/posix/parse";

export async function updateExports() {
  const dirname = import.meta.dirname;

  if (dirname) {
    const denoJsonPath = resolve(dirname, "..", "deno.json");

    const denoJson = await readJson(denoJsonPath);

    const modules = await findModules(resolve(dirname, "..", "lib"));

    denoJson.exports = generateExports(modules);

    await writeJson(denoJsonPath, denoJson);
  }
}

async function readJson(path: string) {
  return JSON.parse(await Deno.readTextFile(path));
}

function writeJson(path: string, content: unknown) {
  return Deno.writeTextFile(path, JSON.stringify(content, null, 2) + "\n");
}

function generateExports(modules: string[]) {
  const exports: Record<string, string> = {};

  for (const modulePath of modules) {
    const parsed = posixParse(modulePath);
    exports[`./${posixJoin(parsed.dir, parsed.name)}`] = `./lib/${modulePath}`;
    // exports[`./${modulePath}`] = `./lib/${modulePath}`;
  }

  return exports;
}

async function findModules(path: string) {
  const modules: string[] = [];

  for await (const modulePath of walk(path)) {
    modules.push(modulePath);
  }

  modules.sort();

  return modules;
}

async function* walk(
  parentPath: string,
  exportPath = "",
): AsyncIterable<string> {
  for await (const entry of Deno.readDir(parentPath)) {
    if (entry.name.startsWith("_") || entry.name.endsWith("test.ts")) {
      continue;
    }

    if (entry.isDirectory) {
      yield* walk(
        join(parentPath, entry.name),
        posixJoin(exportPath, entry.name),
      );
    } else {
      yield posixJoin(exportPath, entry.name);
    }
  }
}

if (import.meta.main) {
  await updateExports();
}
