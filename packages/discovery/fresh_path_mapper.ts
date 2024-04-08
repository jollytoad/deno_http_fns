import type { DiscoveredPath } from "./discover_routes.ts";

/**
 * A Fresh-like path mapping function.
 *
 * Supporting Fresh style path segments:
 *
 * `[name]` - to match a single path segment, translates to `:name` in the URLPattern
 * `[...name]` - to match multiple path segments, translates to `:name*` in the URLPattern
 *
 * Also, extends the syntax with support for file extensions (see `byMediaType`) by adding
 * `.ext` (for a required extension) or `[.ext]` (for an optional extension).
 *
 * Example path: `blog/[...path][.ext].tsx`
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
  segments = segments.map(freshPart);
  if (last && last !== "index") {
    segments.push(freshName(last));
  }
  return segments.join("/") || "/";
}

function freshPart(part: string): string {
  if (part.startsWith("[...") && part.endsWith("]")) {
    return `:${part.slice(4, part.length - 1)}*`;
  }
  if (part.startsWith("[") && part.endsWith("]")) {
    return `:${part.slice(1, part.length - 1)}`;
  }
  return part;
}

function freshName(part: string): string {
  if (part.endsWith(".ext")) {
    // a required extension
    return freshPart(part.slice(0, -4)) + "{.:ext}";
  } else if (part.endsWith("[.ext]")) {
    // an optional extension
    return freshPart(part.slice(0, -6)) + "{.:ext}?";
  } else {
    return freshPart(part);
  }
}
