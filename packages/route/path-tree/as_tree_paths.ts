import type { RoutePattern } from "@http/route/types";
import type { Guard, Leaf, TreePath } from "@http/route/path-tree/types";
import { GUARD, LEAF, WILD } from "@http/route/path-tree/symbols";

/**
 * Return all the paths for a PathTree that would match the given RoutePattern.
 */
export function asTreePaths(
  pattern: RoutePattern,
): TreePath[] {
  if (Array.isArray(pattern)) {
    return [...new Set(pattern.flatMap(asTreePaths))];
  } else if (typeof pattern === "string") {
    return asTreePaths_(pattern);
  } else if ("pathname" in pattern && pattern.pathname) {
    return asTreePaths_(pattern.pathname);
  } else {
    return [];
  }
}

function asTreePaths_(pathname: string): TreePath[] {
  let terminal: Leaf | Guard = LEAF;

  if (pathname.endsWith("{/}?")) {
    pathname = pathname.slice(0, -4);
    terminal = GUARD;
  }
  if (pathname.endsWith("{/*}?")) {
    pathname = pathname.slice(0, -5);
    terminal = GUARD;
  }

  const segments = pathname.split("/");
  if (segments.length > 1 && segments[0] === "") segments.shift();

  const treePath: TreePath = [];
  while (segments.length) {
    const segment = segments.shift()!;
    if (/^:[^{}():\\?+*]+$/.test(segment)) {
      treePath.push(WILD);
    } else if (/[{}():\\?+*]/.test(segment)) {
      treePath.push(GUARD);
      break;
    } else {
      treePath.push(segment);
    }
  }
  if (treePath.at(-1) !== GUARD) {
    treePath.push(terminal);
  }
  return [treePath];
}
