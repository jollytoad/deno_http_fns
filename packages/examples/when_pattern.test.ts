import { assertEquals, assertStatus } from "./_test_deps.ts";

Deno.test("whenPattern", async (t) => {
  await using _server = (await import("./when_pattern.ts")).default;

  await t.step("/ is public", async () => {
    const response = await fetch("/");

    assertStatus(response, 200);
    assertEquals(await response.text(), "This is public stuff");
  });

  await t.step("/foo is public", async () => {
    const response = await fetch("/foo");

    assertStatus(response, 200);
    assertEquals(await response.text(), "This is public stuff");
  });

  await t.step("/private wants authentication", async () => {
    const response = await fetch("/private");

    assertStatus(response, 401);
    await response.body?.cancel();
  });

  await t.step("/private/stuff wants authentication", async () => {
    const response = await fetch("/private/stuff");

    assertStatus(response, 401);
    await response.body?.cancel();
  });

  await t.step("/private is accessible when authenticated", async () => {
    const response = await fetch("/private", {
      headers: {
        "Authorization": `Basic ${btoa("username:password")}`,
      },
    });

    assertStatus(response, 200);
    assertEquals(await response.text(), "This is private stuff");
  });
});
