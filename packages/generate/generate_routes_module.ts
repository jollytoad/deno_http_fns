import { type Code, code } from "./code_builder.ts";
import type { GenerateDynamicRouteOptions, GenerateOptions } from "./types.ts";

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
    fileRootUrl,
    moduleOutUrl,
    httpModulePrefix = "@http/",
  } = opts;

  assertIsFileUrl(fileRootUrl, "fileRootUrl");
  assertIsFileUrl(moduleOutUrl, "moduleOutUrl");

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
    httpModulePrefix = "@http/",
  } = opts;

  const handlerCode = await generateHandler({ ...opts, httpModulePrefix });
  const moduleCode = code`export default ${handlerCode}`;

  return moduleCode.toString({
    prefix:
      "// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.\n",
  });
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
