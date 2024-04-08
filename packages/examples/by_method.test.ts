import {
  assertEquals,
  assertHeader,
  assertOk,
  assertStatus,
  STATUS_CODE,
} from "./_test_deps.ts";

Deno.test("by_method", async (t) => {
  await using _server = (await import("./by_method.ts")).default;

  await t.step("GET /hello", async () => {
    const response = await fetch("/hello");

    assertOk(response);
    assertEquals(await response.text(), "Hello world");
  });

  await t.step("HEAD /hello (has no body)", async () => {
    const response = await fetch("/hello", { method: "HEAD" });

    assertOk(response);
    assertStatus(response, STATUS_CODE.OK);
    assertEquals(await response.text(), "");
  });

  await t.step("OPTIONS /hello", async () => {
    const response = await fetch("/hello", { method: "OPTIONS" });

    assertOk(response);
    assertStatus(response, STATUS_CODE.NoContent);
    assertHeader(response, "Allow", "GET, HEAD, OPTIONS");
    await response.body?.cancel();
  });

  await t.step("POST /hello (405)", async () => {
    const response = await fetch("/hello", { method: "POST" });

    assertStatus(response, STATUS_CODE.MethodNotAllowed);
    await response.body?.cancel();
  });

  await t.step("GET /some/thing", async () => {
    const response = await fetch("/some/thing", { method: "GET" });

    assertOk(response);
    assertEquals(await response.text(), "GET from some/thing");
  });

  await t.step("PUT /some/thing", async () => {
    const response = await fetch("/some/thing", { method: "PUT" });

    assertOk(response);
    assertEquals(await response.text(), "PUT to some/thing");
  });
});
