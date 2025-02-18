import type { Awaitable } from "../types.ts";
import type { GUARD, LEAF, WILD } from "./symbols.ts";

/**
 * The PathTree structure passed to `byPathTree` or `findInPathTree`.
 */
export interface PathTree<T> {
  /**
   * Declare the handler(s) for when the path matches no further than this branch
   */
  [LEAF]?: T | Iterable<T>;
  /**
   * Handler(s) for this branch if reached at any point in the path
   */
  [GUARD]?: T | Iterable<T>;
  /**
   * A wildcard segment match
   */
  [WILD]?: PathTree<T>;
  /**
   * An exact segment match
   */
  [segment: string]: PathTree<T>;
}

/** Unique symbol type of WILD */
export type Wild = typeof WILD;

/** Unique symbol type of LEAF */
export type Leaf = typeof LEAF;

/** Unique symbol type of GUARD */
export type Guard = typeof GUARD;

/**
 * Describe a path through a PathTree.
 * This useful if building a PathTree.
 */
export type TreePath = (string | Wild | Leaf | Guard)[];

/**
 * A handler with a PathTree given to `byPathTree`, where the segmented URL
 * path is inserted into the handler arguments.
 */
export type PathTreeHandler<A extends unknown[] = unknown[], R = Response> = (
  req: Request,
  segments: string[],
  ...args: A
) => Awaitable<R | null>;
