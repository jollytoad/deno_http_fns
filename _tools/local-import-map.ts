#!/usr/bin/env -S deno run --allow-read=. --allow-write=.

import { resolve } from "@std/path/resolve";
import { join } from "@std/path/posix/join";
import { readDenoConfig, readJson, rootPath, writeJson } from "./_utils.ts";
import { sortByKey } from "./_utils.ts";

export async function buildLocalImportMap() {
  if (rootPath) {
    const importMapPath = resolve(rootPath, "import_map_local.json");
    const rootDenoJson = await readDenoConfig();

    if (!rootDenoJson) {
      throw new Error(`deno.json not found!`);
    }

    const importsIn = { ...rootDenoJson.imports };
    const imports: Record<string, string> = {};

    for (const workspacePath of rootDenoJson.workspaces as string[]) {
      const pkgDenoJsonPath = resolve(rootPath, workspacePath, "deno.json");
      const pkgDenoJson = await readJson(pkgDenoJsonPath);

      if (importsIn[pkgDenoJson.name]) {
        delete importsIn[pkgDenoJson.name];

        for (
          const [alias, target] of Object.entries(
            pkgDenoJson.exports as Record<string, string>,
          )
        ) {
          const fullAlias = join(pkgDenoJson.name, alias);
          const fullTarget = "./" + join(workspacePath, target);
          imports[fullAlias] = fullTarget;
        }
      }
    }

    Object.assign(imports, importsIn);

    for (const [alias, target] of Object.entries(importsIn)) {
      const m = /^(npm|jsr):([^/].+[^/])$/.exec(target);
      if (m) {
        imports[`${alias}/`] = `${m[1]}:/${m[2]}/`;
      }
    }

    await writeJson(importMapPath, { imports: sortByKey(imports) });
  }
}

if (import.meta.main) {
  await buildLocalImportMap();
}
