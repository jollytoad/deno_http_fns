import {
  fromFileUrl,
  join,
  parse,
} from "https://deno.land/std@0.182.0/path/mod.ts";

export type RouteTuple = [pattern: string, moduleUrl: string];

/**
 * Utility to walk the local filesystem for handlers.
 *
 * @param pattern the root URL pattern, under which all found handlers are nested
 * @param fileRootUrl the root folder in the filesystem as a `file:` URL
 * @returns an Iterable of tuples of the URL pattern to match to the handler module URL
 */
export function walkRoutes(pattern: string, fileRootUrl: string) {
  return walk(pattern === "/" ? "" : pattern, fromFileUrl(fileRootUrl));
}

function* walk(rootPattern: string, path: string): Iterable<RouteTuple> {
  for (const entry of Deno.readDirSync(path)) {
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
        const moduleUrl = join(path, entry.name);
        yield [modulePattern, moduleUrl];
      }
    }
  }
}
