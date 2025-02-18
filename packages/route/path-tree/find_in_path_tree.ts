import { GUARD, LEAF, WILD } from "./symbols.ts";
import type { PathTree } from "./types.ts";

/**
 * Find nodes within a tree for a given path.
 *
 * The tree branches represent the segments of a path,
 * and may be an exact match or a wildcard.
 *
 * @param tree the PathTree to walk
 * @param segments the URL path split on `/` (ie: `url.pathname.split("/")`)
 * @param index the segment index to start from (defaults to 1)
 */
export function* findInPathTree<T>(
  tree: PathTree<T>,
  segments: string[],
  index = 1,
): Iterable<T> {
  const segment = segments.at(index);
  if (tree[GUARD]) {
    yield* nodes(tree[GUARD]);
  }
  if (segment === undefined) {
    // We've reached the end of the path, so look for a leaf on this branch
    if (tree[LEAF]) {
      yield* nodes(tree[LEAF]);
    }
  } else {
    // Follow the a branch that exactly matches the current path segment
    if (tree[segment]) {
      yield* findInPathTree(tree[segment], segments, index + 1);
    }
    // Follow the a wildcard branch, as a fallback
    if (tree[WILD]) {
      yield* findInPathTree(tree[WILD], segments, index + 1);
    }
  }
}

function* nodes<T>(node: NonNullable<T> | Iterable<T>): Iterable<T> {
  if (typeof node === "object" && Symbol.iterator in node) {
    yield* node;
  } else {
    yield node;
  }
}
