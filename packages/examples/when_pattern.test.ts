import { assertEquals } from "@std/assert";
import { assertStatus, STATUS_CODE } from "@http/assert";
import { getBaseUrl } from "./_base_url.ts";

Deno.test("whenPattern", async (t) => {
  await using server = (await import("./when_pattern.ts")).default;
  const baseUrl = getBaseUrl(server);

  await t.step("/ is public", async () => {
    const response = await fetch(`${baseUrl}/`);

    assertStatus(response, STATUS_CODE.OK);
    assertEquals(await response.text(), "This is public stuff");
  });

  await t.step("/foo is public", async () => {
    const response = await fetch(`${baseUrl}/foo`);

    assertStatus(response, STATUS_CODE.OK);
    assertEquals(await response.text(), "This is public stuff");
  });

  await t.step("/private wants authentication", async () => {
    const response = await fetch(`${baseUrl}/private`);

    assertStatus(response, STATUS_CODE.Unauthorized);
    await response.body?.cancel();
  });

  await t.step("/private/stuff wants authentication", async () => {
    const response = await fetch(`${baseUrl}/private/stuff`);

    assertStatus(response, STATUS_CODE.Unauthorized);
    await response.body?.cancel();
  });

  await t.step("/private is accessible when authenticated", async () => {
    const response = await fetch(`${baseUrl}/private`, {
      headers: {
        "Authorization": `Basic ${btoa("username:password")}`,
      },
    });

    assertStatus(response, STATUS_CODE.OK);
    assertEquals(await response.text(), "This is private stuff");
  });
});
