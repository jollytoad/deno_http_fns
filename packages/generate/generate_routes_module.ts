import type { Code } from "./code-builder/types.ts";
import { generateModule, resolveImports } from "./code-builder/generate.ts";
import { relativeModuleResolver } from "./resolver.ts";
import type { GenerateDynamicRouteOptions, GenerateOptions } from "./types.ts";
import { exportDefault } from "./code-builder/_export.ts";

export type { GenerateOptions };

/**
 * Generate a TypeScript module that exports a routing handler as the default function.
 *
 * The generated code will vary depending on the options given.
 */
export async function generateRoutesModule(
  opts: GenerateOptions,
): Promise<boolean> {
  const {
    moduleOutUrl,
    httpModulePrefix = "@http/",
  } = opts;

  const writeModule = opts.writeModule ??
    (await import("./write_module.ts")).default;

  const content = await generateRoutesModuleContent({
    ...opts,
    httpModulePrefix,
  });

  return writeModule(moduleOutUrl, content);
}

/**
 * Generate routes module content.
 */
export async function generateRoutesModuleContent(
  opts: GenerateOptions,
): Promise<string> {
  const {
    formatModule,
    fileRootUrl,
    moduleOutUrl,
    httpModulePrefix = "@http/",
  } = opts;

  assertIsFileUrl(fileRootUrl, "fileRootUrl");
  assertIsFileUrl(moduleOutUrl, "moduleOutUrl");

  const handlerCode = await generateHandler({ ...opts, httpModulePrefix });
  const moduleCode = exportDefault(handlerCode);
  resolveImports(moduleCode, relativeModuleResolver(opts.moduleOutUrl));

  let content =
    "// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.\n\n" +
    generateModule(moduleCode);

  if (formatModule) {
    content = await formatModule(moduleOutUrl, content);
  }

  return content;
}

async function generateHandler(opts: GenerateOptions): Promise<Code> {
  switch (opts.routeDiscovery) {
    case "startup":
    case "request": {
      const { generateDynamicRouteHandler } = await import(
        "./_generate_dynamic_route_handler.ts"
      );
      return generateDynamicRouteHandler(opts as GenerateDynamicRouteOptions);
    }

    case "static":
    default: {
      const { generateStaticRoutesHandler } = await import(
        "./_generate_static_routes_handler.ts"
      );
      return generateStaticRoutesHandler(opts);
    }
  }
}

function assertIsFileUrl(
  url: string | URL | undefined,
  prop: string,
): void | never {
  if (!url || !URL.canParse(url) || new URL(url).protocol !== "file:") {
    throw new TypeError(
      `${prop} must be an absolute file URL, consider using 'import.meta.resolve'`,
    );
  }
}
