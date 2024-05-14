import { byPattern } from "./by_pattern.ts";
import { ok } from "@http/response/ok";
import type { RoutePattern } from "./types.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertStrictEquals,
} from "./_test_deps.ts";

Deno.test("byPattern with '/' pattern matches URL with no path or trailing slash", async () => {
  await assertByPatternMatches("/", "http://example.com");
});

Deno.test("byPattern accepts a single pattern string", async () => {
  await assertByPatternMatches("/foo", "http://example.com/foo");
  await assertByPatternDoesNotMatch("/foo", "http://example.com/nah");
});

Deno.test("byPattern accepts an array of pattern strings", async () => {
  await assertByPatternMatches(["/foo", "/bar"], "http://example.com/foo");
  await assertByPatternMatches(["/foo", "/bar"], "http://example.com/bar");
  await assertByPatternDoesNotMatch(["/foo", "/bar"], "http://example.com/nah");
});

Deno.test("byPattern accepts a URLPatternInit", async () => {
  const pattern: URLPatternInit = {
    protocol: "http",
    hostname: "example.com",
    pathname: "/anything",
  };
  await assertByPatternMatches(pattern, "http://example.com/anything");
  await assertByPatternDoesNotMatch(pattern, "https://example.com/anything");
  await assertByPatternDoesNotMatch(pattern, "http://example.org/anything");
  await assertByPatternDoesNotMatch(pattern, "http://example.com/otherthing");
});

Deno.test("byPattern accepts a URLPattern", async () => {
  const pattern: URLPattern = new URLPattern({
    protocol: "http",
    hostname: "example.com",
    pathname: "/anything",
  });
  await assertByPatternMatches(pattern, "http://example.com/anything");
  await assertByPatternDoesNotMatch(pattern, "https://example.com/anything");
  await assertByPatternDoesNotMatch(pattern, "http://example.org/anything");
  await assertByPatternDoesNotMatch(pattern, "http://example.com/otherthing");
});

Deno.test("byPattern passes URLPatternResult as 2nd arg", async () => {
  let match!: URLPatternResult;

  await doByPattern("/:path", "http://example.com/foo", (_req, match_) => {
    match = match_;
    return ok();
  });

  assertStrictEquals(match.pathname.groups.path, "foo");
});

Deno.test("byPattern spreads original args from 3rd arg onwards", async () => {
  let args!: unknown[];

  await byPattern("/foo", (_req, _match, ...args_) => {
    args = args_;
    return ok();
  })(new Request("http://example.com/foo"), "A", "B", "C");

  assertEquals(args, ["A", "B", "C"]);
});

function doByPattern(
  pattern: RoutePattern,
  url: string,
  handler?: Parameters<typeof byPattern>[1],
) {
  return byPattern(pattern, handler ?? (() => ok()))(new Request(url));
}

async function assertByPatternMatches(pattern: RoutePattern, url: string) {
  assertInstanceOf(
    await doByPattern(pattern, url),
    Response,
    `Expecting ${pattern} to match ${url}`,
  );
}

async function assertByPatternDoesNotMatch(pattern: RoutePattern, url: string) {
  assertStrictEquals(
    await doByPattern(pattern, url),
    null,
    `Expecting ${pattern} NOT to match ${url}`,
  );
}
