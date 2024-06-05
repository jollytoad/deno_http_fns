import { assertEquals } from "@std/assert";
import {
  assertHeader,
  assertOk,
  assertStatus,
  STATUS_CODE,
} from "@http/assert";
import { getBaseUrl } from "./_base_url.ts";

Deno.test("by_method", async (t) => {
  await using server = (await import("./by_method.ts")).default;
  const baseUrl = getBaseUrl(server);

  await t.step("GET /hello", async () => {
    const response = await fetch(`${baseUrl}/hello`);

    assertOk(response);
    assertEquals(await response.text(), "Hello world");
  });

  await t.step("HEAD /hello (has no body)", async () => {
    const response = await fetch(`${baseUrl}/hello`, { method: "HEAD" });

    assertOk(response);
    assertStatus(response, STATUS_CODE.OK);
    assertEquals(await response.text(), "");
  });

  await t.step("OPTIONS /hello", async () => {
    const response = await fetch(`${baseUrl}/hello`, { method: "OPTIONS" });

    assertOk(response);
    assertStatus(response, STATUS_CODE.NoContent);
    assertHeader(response, "Allow", "GET, HEAD, OPTIONS");
    await response.body?.cancel();
  });

  await t.step("POST /hello (405)", async () => {
    const response = await fetch(`${baseUrl}/hello`, { method: "POST" });

    assertStatus(response, STATUS_CODE.MethodNotAllowed);
    await response.body?.cancel();
  });

  await t.step("GET /some/thing", async () => {
    const response = await fetch(`${baseUrl}/some/thing`, { method: "GET" });

    assertOk(response);
    assertEquals(await response.text(), "GET from some/thing");
  });

  await t.step("PUT /some/thing", async () => {
    const response = await fetch(`${baseUrl}/some/thing`, { method: "PUT" });

    assertOk(response);
    assertEquals(await response.text(), "PUT to some/thing");
  });
});
