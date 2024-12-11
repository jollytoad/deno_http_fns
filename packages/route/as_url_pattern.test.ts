import { assertEquals, assertStrictEquals } from "@std/assert";
import { asURLPattern } from "./as_url_pattern.ts";

Deno.test("asURLPattern accepts *:// URLs", () => {
  const pattern = asURLPattern("*://:host/path/here");

  assertEquals(pattern.protocol, "*");
  assertEquals(pattern.hostname, ":host");
  assertEquals(pattern.pathname, "/path/here");
});

Deno.test("asURLPattern accepts https:// URLs", () => {
  const pattern = asURLPattern("https://:host/path/here");

  assertEquals(pattern.protocol, "https");
  assertEquals(pattern.hostname, ":host");
  assertEquals(pattern.pathname, "/path/here");
});

Deno.test("asURLPattern accepts relative paths", () => {
  const pattern = asURLPattern("/path/here/:ok");

  assertEquals(pattern.protocol, "*");
  assertEquals(pattern.hostname, "*");
  assertEquals(pattern.pathname, "/path/here/:ok");
});

Deno.test("asURLPattern accepts a URLPatternInit object", () => {
  const pattern = asURLPattern({
    protocol: "https",
    pathname: "/path/here/:ok",
  });

  assertEquals(pattern.protocol, "https");
  assertEquals(pattern.hostname, "*");
  assertEquals(pattern.pathname, "/path/here/:ok");
});

Deno.test("asURLPattern returns a URLPattern unchanged", () => {
  const originalPattern = new URLPattern("https://*/path/here/:ok");

  const pattern = asURLPattern(originalPattern);

  assertStrictEquals(pattern, originalPattern);
});
