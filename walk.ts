import {
  fromFileUrl,
  join,
  parse,
  toFileUrl,
} from "https://deno.land/std@0.193.0/path/mod.ts";
import { sortBy } from "https://deno.land/std@0.193.0/collections/sort_by.ts";

export type RouteTuple = [pattern: string, moduleUrl: string];

/**
 * Utility to walk the local filesystem for handlers.
 *
 * @param pattern the root URL pattern, under which all found handlers are nested
 * @param fileRootUrl the root folder in the filesystem as a `file:` URL
 * @returns an Iterable of tuples of the URL pattern to match to the handler module URL
 */
export async function walkRoutes(
  pattern: string,
  fileRootUrl: string,
  verbose = false,
): Promise<RouteTuple[]> {
  // TODO: Sort using something like URLPattern.compareComponent if it becomes available
  // See: https://github.com/WICG/urlpattern/issues/61

  const routes = [];
  for await (
    const pair of walk(pattern === "/" ? "" : pattern, fromFileUrl(fileRootUrl))
  ) {
    routes.push(pair);
    if (verbose) {
      console.debug(
        `Found route: %c${pair[0]}%c -> %c${pair[1]}`,
        "color: yellow",
        "color: inherit",
        "color: cyan",
      );
    }
  }

  return sortBy(routes, ([pattern]) => pattern).reverse();
}

async function* walk(
  rootPattern: string,
  path: string,
): AsyncIterable<RouteTuple> {
  for await (const entry of Deno.readDir(path)) {
    if (entry.isDirectory) {
      yield* walk(`${rootPattern}/${entry.name}`, join(path, entry.name));
    } else {
      const p = parse(entry.name);
      let sub = undefined;

      switch (p.ext) {
        case ".ts":
        case ".tsx":
          sub = p.name === "index" ? "" : p.name;
      }

      if (typeof sub === "string") {
        const modulePattern = `${rootPattern}/${sub}`;
        const moduleUrl = toFileUrl(join(path, entry.name));
        yield [modulePattern, moduleUrl.href];
      }
    }
  }
}
