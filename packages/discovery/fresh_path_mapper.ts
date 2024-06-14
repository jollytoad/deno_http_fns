import type { DiscoveredPath } from "./types.ts";

/**
 * A Fresh-like path mapping function.
 *
 * Supporting Fresh style path segments:
 *
 * `[name]` - to match a single path segment, translates to `:name` in the URLPattern
 * `[...name]` - to match multiple path segments, translates to `:name*` in the URLPattern
 * `[[name]]` - match an optional path segment, translates to `:name?`
 * `(name)` - for grouping, the segment is not added to the URLPattern
 *
 * Also, extends the syntax with support for file extensions (see `byMediaType`) by adding
 * `.ext` (for a required extension) or `[.ext]` (for an optional extension).
 *
 * Example path: `blog/[...path][.ext].tsx`
 *
 * @example
 * ```ts
 * const routes = await discoverRoutes({
 *   pathMapper: freshPathMapper
 * });
 * ```
 */
export function freshPathMapper(entry: DiscoveredPath): DiscoveredPath {
  return {
    ...entry,
    pattern: freshPath(entry.pattern),
  };
}

export default freshPathMapper;

function freshPath(path: string): string {
  let segments = path.split("/");
  const last = segments.pop();
  segments = segments.flatMap(freshPart);
  if (last && last !== "index") {
    segments.push(...freshName(last));
  }
  return segments.join("") || "/";
}

const DOUBLE_BRACKET_RE = /\[\[(.+?)\]\]/g;
const SINGLE_BRACKET_RE = /\[(.+?)\]/g;

function freshPart(part: string): string[] {
  if (part.startsWith("(") && part.endsWith(")")) {
    return [];
  }
  if (part.startsWith("[...") && part.endsWith("]")) {
    return [`/:${part.slice(4, part.length - 1)}*`];
  }
  if (DOUBLE_BRACKET_RE.test(part)) {
    part = part.replaceAll(DOUBLE_BRACKET_RE, ":$1?");
  }
  if (SINGLE_BRACKET_RE.test(part)) {
    part = part.replaceAll(SINGLE_BRACKET_RE, ":$1");
  }
  return part ? [`/${part}`] : [];
}

function freshName(part: string): string[] {
  if (part.endsWith(".ext")) {
    // a required extension
    return [...freshPart(part.slice(0, -4)), "{.:ext}"];
  } else if (part.endsWith("[.ext]")) {
    // an optional extension
    return [...freshPart(part.slice(0, -6)), "{.:ext}?"];
  } else {
    return freshPart(part);
  }
}
