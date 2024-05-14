import { assertEquals } from "@std/assert";
import { assertOk } from "@http/assert";

Deno.test("lazy", async (t) => {
  await using _server = (await import("./lazy.ts")).default;

  await t.step("lazy(() => import(...))", async () => {
    const response = await fetch("/test-import");

    assertOk(response);
    assertEquals(await response.text(), "Lazy handler module");
  });

  await t.step("lazy(import.meta.resolve(...))", async () => {
    const response = await fetch("/test-resolve");

    assertOk(response);
    assertEquals(await response.text(), "Lazy handler module");
  });

  await t.step("lazy(async () => () => ...)", async () => {
    const response = await fetch("/test-async");

    assertOk(response);
    assertEquals(await response.text(), "Lazy async handler");
  });

  await t.step("lazy(() => () => ...)", async () => {
    const response = await fetch("/test-sync");

    assertOk(response);
    assertEquals(await response.text(), "Lazy sync handler");
  });
});
