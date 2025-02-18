import { GUARD, LEAF, WILD } from "@http/route/path-tree/symbols";
import type { TreePath } from "@http/route/path-tree/types";
import { assertArrayIncludes } from "@std/assert/array-includes";
import { asTreePaths } from "./as_tree_paths.ts";

Deno.test("asTreePath", async (t) => {
  const paths: Record<string, TreePath[]> = {
    "": [["", LEAF]],
    "/": [["", LEAF]],
    "*": [[GUARD]],
    "/*": [[GUARD]],
    "/foo": [["foo", LEAF]],
    "/foo/": [["foo", "", LEAF]],
    "/:name": [[WILD, LEAF]],
    "/:name/": [[WILD, "", LEAF]],
    "/:name/:more": [[WILD, WILD, LEAF]],
    "/foo/*": [["foo", GUARD]],
    "/foo/:name": [["foo", WILD, LEAF]],
    "/foo/*/bar": [["foo", GUARD]],
    "/foo/:name/bar": [["foo", WILD, "bar", LEAF]],
    "/foo{/}?": [["foo", GUARD]],
    "/foo{/*}?": [["foo", GUARD]],
    "/foo:name{/}?": [[GUARD]],
  };

  for (const [pattern, treePaths] of Object.entries(paths)) {
    await t.step(`${pattern}`, () => {
      assertArrayIncludes(asTreePaths(pattern), treePaths);
    });
  }
});
