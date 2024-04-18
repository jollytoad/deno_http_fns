import {
  assertEquals,
  assertNotStrictEquals,
  assertStrictEquals,
} from "@std/assert";
import { appendHeaders } from "./append_headers.ts";

Deno.test("append to mutable Response", () => {
  const res1 = new Response();

  const res2 = appendHeaders(res1, { "content-type": "text/html" });

  assertStrictEquals(res2, res1, "expected the same Response object");
  assertEquals(res2.headers.get("content-type"), "text/html");
});

Deno.test("append to immutable Response", async () => {
  const res1 = await fetch("data:,");

  const res2 = appendHeaders(res1, { "custom-header": "foo" });

  await res1.body?.cancel();

  assertNotStrictEquals(res2, res1, "expected a different Response object");
  assertEquals(res2.headers.get("custom-header"), "foo");
});

Deno.test("appending multiple times results in comma separated values", () => {
  let res = new Response();

  res = appendHeaders(res, { "custom-header": "one" });
  res = appendHeaders(res, { "custom-header": "two" });
  res = appendHeaders(res, { "custom-header": "three" });

  assertEquals(res.headers.get("custom-header"), "one, two, three");
});
