import { assertEquals } from "@std/assert";
import { assertOk } from "@http/assert";
import { getBaseUrl } from "./_base_url.ts";

Deno.test("lazy", async (t) => {
  await using server = (await import("./lazy.ts")).default;
  const baseUrl = getBaseUrl(server);

  await t.step("lazy(() => import(...))", async () => {
    const response = await fetch(`${baseUrl}/test-import`);

    assertOk(response);
    assertEquals(await response.text(), "Lazy handler module");
  });

  await t.step("lazy(import.meta.resolve(...))", async () => {
    const response = await fetch(`${baseUrl}/test-resolve`);

    assertOk(response);
    assertEquals(await response.text(), "Lazy handler module");
  });

  await t.step("lazy(async () => () => ...)", async () => {
    const response = await fetch(`${baseUrl}/test-async`);

    assertOk(response);
    assertEquals(await response.text(), "Lazy async handler");
  });

  await t.step("lazy(() => () => ...)", async () => {
    const response = await fetch(`${baseUrl}/test-sync`);

    assertOk(response);
    assertEquals(await response.text(), "Lazy sync handler");
  });
});
