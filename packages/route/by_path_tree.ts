import { findInPathTree } from "./path-tree/find_in_path_tree.ts";
import type { PathTree, PathTreeHandler } from "./path-tree/types.ts";
import type { Awaitable } from "./types.ts";

export * from "./path-tree/symbols.ts";
export type * from "./path-tree/types.ts";

/**
 * Create a Request handler that matches the path of the Request based on tree
 * of paths and handlers.
 *
 * The tree is designed to narrow down a potentially large cascade of handlers
 * to a small handful, it is therefore keep deliberately simple with the
 * very general WILD matching segment that just accepts whatever value is in
 * the path for that segment, rather than implementing any particular flavour
 * of pattern matching. It's expected the handlers themselves will perform more
 * specific matching, and rely on the cascading behaviour to allow further
 * finer grained routing.
 *
 * The tree is a set of nested objects per URL path segment, where the keys of
 * the object represent the path segment or a type of handler.
 *
 * Path segments are either exact string matches or wildcard matches
 * (represented by the WILD symbol).
 *
 * The tree may contain two types of handlers represented by the LEAF or GUARD
 * symbols.
 *
 * LEAF handlers are returned only when found at the end of a path, where-as
 * GUARDS are returned wherever they are found along the path. As the name
 * suggests, this makes them useful for guarding an entire sub-tree, the guard
 * can return a response to veto further handlers including the LEAF handler,
 * or null to allow further handling to continue.
 *
 * Each LEAF or GUARD may be one or many handlers.
 *
 * If multiple handlers are found for a single path they are each called in
 * order until one returns a Response (actually a truthy value).
 * This is the same behaviour as the `cascade` function.
 *
 * @param tree the tree to traverse and match the Request path against
 * @template A the additional arguments passed to the handler
 * @template R the Response or an alternative response type
 * @returns a Request handler that returns a Response or null
 *
 * @example
 * ```ts
 * import { byPathTree, LEAF } from "@http/route/by-path-tree";
 * import { handle } from "@http/route/handle";
 *
 * Deno.serve(handle([
 *   byPathTree({
 *     "hello": {
 *       [LEAF]: () => new Response(`Hello`);
 *       "world": {
 *         [LEAF]: () => new Response(`Hello World!`);
 *       },
 *       [WILD]: {
 *         [LEAF]: (_req, segments) => new Response(`Hello ${segments[2]}`);
 *       }
 *     }
 *   })
 * ]));
 * ```
 */
export function byPathTree<A extends unknown[], R = Response>(
  tree: PathTree<PathTreeHandler<A, R>>,
): (req: Request, ...args: A) => Awaitable<R | null> {
  return async (req: Request, ...args: A) => {
    const segments = new URL(req.url).pathname.split("/");
    for (const handler of findInPathTree(tree, segments)) {
      const res = await handler(req, segments, ...args);
      if (res) {
        return res;
      }
    }
    return null;
  };
}
