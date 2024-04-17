import { assertEquals, assertStrictEquals } from "@std/assert";
import { invalidate, memoize } from "./memoize.ts";

Deno.test("memoized function is called only once for same arg", () => {
  let callCount = 0;

  const getUrl = memoize((req: Request) => {
    callCount++;
    return new URL(req.url);
  });

  const req = new Request("http://example.com");

  assertEquals(callCount, 0);

  const url1 = getUrl(req);

  assertEquals(callCount, 1);

  const url2 = getUrl(req);

  assertEquals(callCount, 1);

  assertStrictEquals(url2, url1);
});

Deno.test("memoized function is called again for different arg", () => {
  let callCount = 0;

  const getUrl = memoize((req: Request) => {
    callCount++;
    return new URL(req.url);
  });

  const req1 = new Request("http://example.com");
  const req2 = new Request("http://example.com");

  assertEquals(callCount, 0);

  getUrl(req1);

  assertEquals(callCount, 1);

  getUrl(req2);

  assertEquals(callCount, 2);
});

Deno.test("invalidate all memos associated with an argument", () => {
  let callCount = 0;

  const getUrl = memoize((req: Request) => {
    callCount++;
    return new URL(req.url);
  });

  const req = new Request("http://example.com");

  assertEquals(callCount, 0);

  getUrl(req);

  assertEquals(callCount, 1);

  invalidate(req);

  getUrl(req);

  assertEquals(callCount, 2);
});

Deno.test("invalidate a particular memo associated with an argument", () => {
  let callCount = 0;

  const getUrl = memoize((req: Request) => {
    callCount++;
    return new URL(req.url);
  });

  const req = new Request("http://example.com");

  assertEquals(callCount, 0);

  getUrl(req);

  assertEquals(callCount, 1);

  invalidate(req, getUrl);

  getUrl(req);

  assertEquals(callCount, 2);
});
