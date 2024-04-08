import { resolve } from "@std/path/resolve";
import { join } from "@std/path/join";
import { relative } from "@std/path/relative";
import { join as posixJoin } from "@std/path/posix/join";
import { parse as posixParse } from "@std/path/posix/parse";

const rootPath = import.meta.dirname
  ? resolve(import.meta.dirname, "..")
  : undefined;

export async function updatePackages(version?: string) {
  if (rootPath) {
    const rootDenoJsonPath = resolve(rootPath, "deno.json");
    const packagesPath = resolve(rootPath, "packages");

    const rootDenoJson = await readJson(rootDenoJsonPath);

    if (!rootDenoJson) {
      throw new Error(`${rootDenoJsonPath} not found!`);
    }

    rootDenoJson.workspaces ??= [];

    for await (const entry of Deno.readDir(packagesPath)) {
      const pkgDenoJsonPath = resolve(packagesPath, entry.name, "deno.json");
      const pkgDenoJson = await readJson(pkgDenoJsonPath) ?? {};

      pkgDenoJson.name = `@http/${entry.name}`;
      if (version) {
        pkgDenoJson.version = version;
      }

      const modules = await findModules(resolve(packagesPath, entry.name));

      pkgDenoJson.exports = generateExports(modules);

      await writeJson(pkgDenoJsonPath, pkgDenoJson);

      const workspacePath = `./packages/${entry.name}`;

      if (!rootDenoJson.workspaces.includes(workspacePath)) {
        rootDenoJson.workspaces.push(workspacePath);
        rootDenoJson.workspaces.sort();
      }

      if (!rootDenoJson.imports[`@http/${entry.name}`]) {
        rootDenoJson.imports[`@http/${entry.name}`] = `jsr:@http/${entry.name}`;
      }
    }

    await writeJson(rootDenoJsonPath, rootDenoJson);
  }
}

async function readJson(path: string) {
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

async function writeJson(path: string, content: unknown) {
  const newContent = JSON.stringify(content, null, 2) + "\n";
  const oldContent = JSON.stringify(await readJson(path), null, 2) + "\n";

  if (newContent !== oldContent) {
    await Deno.writeTextFile(path, newContent);
    console.log(`Updated: %c${relative(rootPath!, path)}`, "font-weight: bold");
    return true;
  }

  return false;
}

function generateExports(modules: string[]) {
  const exports: Record<string, string> = {};

  for (const modulePath of modules) {
    const parsed = posixParse(modulePath);
    if (parsed.ext === ".ts") {
      const name = parsed.name.replaceAll("_", "-");
      exports[`./${posixJoin(parsed.dir, name)}`] = `./${modulePath}`;
    }
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
    if (
      entry.name.startsWith("_") || entry.name.endsWith("test.ts") ||
      entry.name === "deno.json"
    ) {
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
  await updatePackages(Deno.args[0]);
}
