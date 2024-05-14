import { assertEquals } from "@std/assert";
import { assertOk, assertStatus, STATUS_CODE } from "@http/assert";

Deno.test("generated routes.ts", async (t) => {
  await using _server = (await import("./generated_routes.ts")).default;

  await t.step("GET /", async () => {
    const response = await fetch("/");

    assertOk(response);
    assertEquals(await response.text(), "This is the index page");
  });

  await t.step("GET /user/bob", async () => {
    const response = await fetch("/user/bob");

    assertOk(response);
    assertEquals(await response.text(), "Hello bob");
  });

  await t.step("GET /methods", async () => {
    const response = await fetch("/methods");

    assertOk(response);
    assertEquals(await response.text(), "GET method");
  });

  await t.step("PUT /methods", async () => {
    const response = await fetch("/methods", { method: "PUT" });

    assertOk(response);
    assertEquals(await response.text(), "PUT method");
  });

  await t.step("POST /methods", async () => {
    const response = await fetch("/methods", { method: "POST" });

    assertOk(response);
    assertEquals(await response.text(), "POST method");
  });

  await t.step("DELETE /methods (405)", async () => {
    const response = await fetch("/methods", { method: "DELETE" });

    assertStatus(response, STATUS_CODE.MethodNotAllowed);
    await response.body?.cancel();
  });
});
