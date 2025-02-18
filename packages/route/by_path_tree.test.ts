import { assertInstanceOf } from "@std/assert/instance-of";
import {
  byPathTree,
  GUARD,
  LEAF,
  type PathTree,
  type PathTreeHandler,
  WILD,
} from "./by_path_tree.ts";
import { ok } from "@http/response/ok";
import { assertEquals } from "@std/assert/equals";
import { assertSpyCall, spy } from "@std/testing/mock";

const resp = (value: string) => () => ok(value);

const nahSpy = spy(() => null);
const guardSpy = spy(() => null);

const tree = {
  "": {
    [LEAF]: resp("root"),
  },
  "foo": {
    [LEAF]: resp("foo"),
    "bar": {
      [LEAF]: resp("foo/bar"),
    },
    "nah": {
      [LEAF]: nahSpy,
    },
    [WILD]: {
      [LEAF]: resp("foo/*"),
    },
  },
  "long": {
    [WILD]: {
      [LEAF]: resp("not the long path"),
      [WILD]: {
        [GUARD]: guardSpy,
        "path": {
          [LEAF]: resp("long path"),
        },
      },
    },
  },
};

Deno.test("byPathTree find root", async () => {
  await assertByPathTreeMatches(tree, "/", "root");
});

Deno.test("byPathTree find first level", async () => {
  await assertByPathTreeMatches(tree, "/foo", "foo");
});

Deno.test("byPathTree find exact route", async () => {
  await assertByPathTreeMatches(tree, "/foo/bar", "foo/bar");
});

Deno.test("byPathTree find wildcard route", async () => {
  await assertByPathTreeMatches(tree, "/foo/doh", "foo/*");
});

Deno.test("byPathTree find route that cascades to wildcard route", async () => {
  await assertByPathTreeMatches(tree, "/foo/nah", "foo/*");
  assertSpyCall(nahSpy, 0);
});

Deno.test("byPathTree find route with multiple wildcards and guard", async () => {
  await assertByPathTreeMatches(tree, "/long/and/winding/path", "long path");
  assertSpyCall(guardSpy, 0);
});

function doByPathTree(tree: PathTree<PathTreeHandler<[]>>, path: string) {
  return byPathTree(tree)(new Request(new URL(path, "http://localhost")));
}

async function assertByPathTreeMatches(
  tree: PathTree<PathTreeHandler<[]>>,
  path: string,
  expectedBody: string,
) {
  const response = await doByPathTree(tree, path);
  assertInstanceOf(
    response,
    Response,
    `Expecting to match ${path} in tree`,
  );
  const body = await response.text();
  assertEquals(body, expectedBody);
}
