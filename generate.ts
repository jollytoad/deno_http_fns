import { walkRoutes } from "./walk.ts";
import {
  dirname,
  fromFileUrl,
  relative,
} from "https://deno.land/std@0.192.0/path/posix.ts";

export interface GenerateOptions {
  dynamic?: boolean;
  httpFns?: URL | string;
}

/**
 * Walk the local filesystem, and generate a TypeScript module of all found handlers.
 *
 * @param pattern the root URL pattern, under which all found handlers are nested
 * @param fileRootUrl the root folder in the filesystem as a `file:` URL
 * @param moduleOutUrl the absolute path of the module to be generated as a `file:` URL
 * @param opts additional options for the generated module
 * @returns true if a new/updated module was written
 */
export function generateRoutesModule(
  pattern: string,
  fileRootUrl: string,
  moduleOutUrl: string,
  opts?: GenerateOptions,
) {
  const outUrl = new URL(moduleOutUrl);

  if (
    Deno.permissions.querySync({ name: "write", path: outUrl }).state !==
      "granted"
  ) {
    // No permission to generate new module
    return;
  }

  const httpFnsUrl = opts?.httpFns ?? new URL("./", import.meta.url).href;
  const outPath = dirname(outUrl.pathname);

  const head: string[] = [];
  const body: string[] = [];
  let i = 1;

  head.push(
    "// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.\n\n",
  );

  if (opts?.dynamic) {
    const dynamic_ts = `${httpFnsUrl}dynamic.ts`;

    head.push(`import { dynamicRoute } from "${dynamic_ts}";\n`);

    let modulePath = relative(outPath, fromFileUrl(fileRootUrl));
    if (modulePath[0] !== ".") {
      modulePath = "./" + modulePath;
    }

    body.push(
      `export default dynamicRoute("${pattern}", import.meta.resolve("${modulePath}"));\n`,
    );
  } else {
    const pattern_ts = `${httpFnsUrl}pattern.ts`;
    const cascade_ts = `${httpFnsUrl}cascade.ts`;

    head.push(`import { byPattern } from "${pattern_ts}";\n`);
    head.push(`import { cascade } from "${cascade_ts}";\n`);

    body.push("export default cascade(\n");

    for (const [modulePattern, moduleUrl] of walkRoutes(pattern, fileRootUrl)) {
      let modulePath = relative(outPath, moduleUrl);
      if (modulePath[0] !== ".") {
        modulePath = "./" + modulePath;
      }
      head.push(`import route_${i} from "${modulePath}";\n`);
      body.push(`  byPattern("${modulePattern}", route_${i}),\n`);
      i++;
    }

    body.push(`);\n`);
  }

  head.push(`\n`);

  const content = head.concat(body).join("");

  let existingContent = undefined;

  if (
    Deno.permissions.querySync({ name: "read", path: outUrl }).state ===
      "granted"
  ) {
    try {
      existingContent = Deno.readTextFileSync(outUrl);
    } catch {
      // Ignore error
    }
  }

  if (content !== existingContent) {
    console.debug("Writing new routes module:", outUrl.pathname);
    Deno.writeTextFileSync(outUrl, content);
    return true;
  }

  return false;
}
