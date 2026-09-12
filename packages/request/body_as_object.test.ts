import { assertEquals, assertRejects } from "@std/assert";
import { getBodyAsObject } from "./body_as_object.ts";

function makeRequest(body: string, contentType?: string): Request {
  const headers = new Headers();
  if (contentType !== undefined) {
    headers.set("content-type", contentType);
  }
  return new Request("http://example.com", {
    method: "POST",
    headers,
    body,
  });
}

async function assertBadRequest(promise: Promise<unknown>) {
  const error = await assertRejects(() => promise);
  assertEquals(error instanceof Response, true);
  assertEquals((error as Response).status, 400);
}

Deno.test("accepts application/json", async () => {
  const req = makeRequest(`{"foo":"bar"}`, "application/json");
  await getBodyAsObject(req);
});

Deno.test("accepts application/json with charset=utf-8", async () => {
  const req = makeRequest(`{"foo":"bar"}`, "application/json; charset=utf-8");
  await getBodyAsObject(req);
});

Deno.test("accepts application/json with charset=UTF-8", async () => {
  const req = makeRequest(`{"foo":"bar"}`, "application/json; charset=UTF-8");
  await getBodyAsObject(req);
});

Deno.test("accepts application/json with mixed case media type", async () => {
  const req = makeRequest(`{"foo":"bar"}`, "Application/JSON");
  await getBodyAsObject(req);
});

Deno.test("accepts application/json;charset=utf-8 without space", async () => {
  const req = makeRequest(`{"foo":"bar"}`, "application/json;charset=utf-8");
  await getBodyAsObject(req);
});

Deno.test("accepts application/x-www-form-urlencoded", async () => {
  const req = makeRequest("foo=bar", "application/x-www-form-urlencoded");
  await getBodyAsObject(req);
});

Deno.test("accepts application/x-www-form-urlencoded with charset=utf-8", async () => {
  const req = makeRequest(
    "foo=bar",
    "application/x-www-form-urlencoded; charset=utf-8",
  );
  await getBodyAsObject(req);
});

Deno.test("accepts multipart/form-data with boundary", async () => {
  const boundary = "----formdata-boundary";
  const body = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="foo"',
    "",
    "bar",
    `--${boundary}--`,
    "",
  ].join("\r\n");
  const req = makeRequest(
    body,
    `multipart/form-data; boundary=${boundary}`,
  );
  await getBodyAsObject(req);
});

Deno.test("rejects empty content-type", async () => {
  const req = makeRequest(`{"foo":"bar"}`, "");
  await assertBadRequest(getBodyAsObject(req));
});

Deno.test("rejects malformed content-type parameters", async () => {
  const req = makeRequest(`{"foo":"bar"}`, "application/json;;;");
  await assertBadRequest(getBodyAsObject(req));
});

Deno.test("rejects missing content-type", async () => {
  const req = makeRequest(`{"foo":"bar"}`);
  await assertBadRequest(getBodyAsObject(req));
});

Deno.test("rejects text/plain", async () => {
  const req = makeRequest("foo", "text/plain");
  await assertBadRequest(getBodyAsObject(req));
});

Deno.test("rejects text/plain with charset", async () => {
  const req = makeRequest("foo", "text/plain; charset=utf-8");
  await assertBadRequest(getBodyAsObject(req));
});
