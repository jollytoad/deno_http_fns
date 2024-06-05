import { assertEquals } from "@std/assert";
import { assertOk, assertStatus, STATUS_CODE } from "@http/assert";
import { getBaseUrl } from "./_base_url.ts";

Deno.test("generated routes.ts", async (t) => {
  await using server = (await import("./generated_routes.ts")).default;
  const baseUrl = getBaseUrl(server);

  await t.step("GET /", async () => {
    const response = await fetch(`${baseUrl}/`);

    assertOk(response);
    assertEquals(await response.text(), "This is the index page");
  });

  await t.step("GET /user/bob", async () => {
    const response = await fetch(`${baseUrl}/user/bob`);

    assertOk(response);
    assertEquals(await response.text(), "Hello bob");
  });

  await t.step("GET /methods", async () => {
    const response = await fetch(`${baseUrl}/methods`);

    assertOk(response);
    assertEquals(await response.text(), "GET method");
  });

  await t.step("PUT /methods", async () => {
    const response = await fetch(`${baseUrl}/methods`, { method: "PUT" });

    assertOk(response);
    assertEquals(await response.text(), "PUT method");
  });

  await t.step("POST /methods", async () => {
    const response = await fetch(`${baseUrl}/methods`, { method: "POST" });

    assertOk(response);
    assertEquals(await response.text(), "POST method");
  });

  await t.step("DELETE /methods (405)", async () => {
    const response = await fetch(`${baseUrl}/methods`, { method: "DELETE" });

    assertStatus(response, STATUS_CODE.MethodNotAllowed);
    await response.body?.cancel();
  });
});
