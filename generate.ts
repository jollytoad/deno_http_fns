import { Eagerness } from "./dynamic.ts";
import { walkRoutes } from "./walk.ts";
import {
  dirname,
  fromFileUrl,
  relative,
} from "https://deno.land/std@0.193.0/path/posix.ts";

export interface GenerateOptions {
  /**
   * Whether to discover routes at build time and generate a static list or,
   * discover them dynamically at startup, or when the first request is made.
   * Defaults to `static`.
   */
  routeDiscovery?: "static" | "startup" | "request";

  /**
   * Whether to generate static imports or dynamic imports,
   * this only applies to 'static' route discovery.
   * Defaults to `dynamic`.
   */
  moduleImports?: "static" | "dynamic";

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
export async function generateRoutesModule(
  pattern: string,
  fileRootUrl: string,
  moduleOutUrl: string,
  opts?: GenerateOptions,
): Promise<boolean> {
  const outUrl = new URL(moduleOutUrl);

  if (!await can("write", outUrl)) {
    // No permission to generate new module
    return false;
  }

  const httpFnsUrl = opts?.httpFns ?? new URL("./", import.meta.url).href;
  const outPath = dirname(outUrl.pathname);

  const head: string[] = [];
  const body: string[] = [];
  let i = 1;

  head.push(
    "// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.\n\n",
  );

  switch (opts?.routeDiscovery) {
    case "startup":
    case "request":
      {
        const dynamic_ts = `${httpFnsUrl}dynamic.ts`;

        head.push(`import { dynamicRoute } from "${dynamic_ts}";\n`);

        let modulePath = relative(outPath, fromFileUrl(fileRootUrl));
        if (modulePath[0] !== ".") {
          modulePath = "./" + modulePath;
        }

        const eagerness: Eagerness = opts.routeDiscovery;

        body.push(
          `export default dynamicRoute("${pattern}", import.meta.resolve("${modulePath}"), "${eagerness}");\n`,
        );
      }
      break;

    case "static":
    default: {
      const isLazy = opts?.moduleImports !== "static";
      const pattern_ts = `${httpFnsUrl}pattern.ts`;
      const cascade_ts = `${httpFnsUrl}cascade.ts`;

      head.push(`import { byPattern } from "${pattern_ts}";\n`);
      head.push(`import { cascade } from "${cascade_ts}";\n`);

      if (isLazy) {
        const lazy_ts = `${httpFnsUrl}lazy.ts`;

        head.push(`import { lazy } from "${lazy_ts}";\n`);
      }

      body.push("export default cascade(\n");

      for (
        const [modulePattern, moduleUrl] of await walkRoutes(
          pattern,
          fileRootUrl,
          true,
        )
      ) {
        let modulePath = relative(outPath, fromFileUrl(moduleUrl));
        if (modulePath[0] !== ".") {
          modulePath = "./" + modulePath;
        }
        if (isLazy) {
          body.push(
            `  byPattern("${modulePattern}", lazy(() => import("${modulePath}"))),\n`,
          );
        } else {
          head.push(`import route_${i} from "${modulePath}";\n`);
          body.push(`  byPattern("${modulePattern}", route_${i}),\n`);
        }
        i++;
      }

      body.push(`);\n`);
    }
  }

  head.push(`\n`);

  const content = head.concat(body).join("");

  let existingContent = undefined;

  if (await can("read", outUrl)) {
    try {
      existingContent = await Deno.readTextFile(outUrl);
    } catch {
      // Ignore error
    }
  }

  if (content !== existingContent) {
    console.debug("Writing new routes module:", outUrl.pathname);
    await Deno.writeTextFile(outUrl, content);
    return true;
  }

  return false;
}

async function can(
  name: "read" | "write",
  path: string | URL,
): Promise<boolean> {
  return (await Deno.permissions.query({ name, path })).state === "granted";
}
