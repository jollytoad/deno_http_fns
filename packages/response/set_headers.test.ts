import {
  assertEquals,
  assertNotStrictEquals,
  assertStrictEquals,
} from "@std/assert";
import { setHeaders } from "./set_headers.ts";

Deno.test("set in mutable Response", () => {
  const res1 = new Response();

  const res2 = setHeaders(res1, { "content-type": "text/html" });

  assertStrictEquals(res2, res1, "expected the same Response object");
  assertEquals(res2.headers.get("content-type"), "text/html");
});

Deno.test("set in immutable Response", async () => {
  const res1 = await fetch("data:,");

  const res2 = setHeaders(res1, { "custom-header": "foo" });

  await res1.body?.cancel();

  assertNotStrictEquals(res2, res1, "expected a different Response object");
  assertEquals(res2.headers.get("custom-header"), "foo");
});

Deno.test("setting multiple times results in overridden values", () => {
  let res = new Response();

  res = setHeaders(res, { "custom-header": "one" });
  res = setHeaders(res, { "custom-header": "two" });
  res = setHeaders(res, { "custom-header": "three" });

  assertEquals(res.headers.get("custom-header"), "three");
});
