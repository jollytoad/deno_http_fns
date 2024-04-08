import { assertEquals, assertStatus } from "./_test_deps.ts";

Deno.test("verifyHeader", async (t) => {
  await using _server = (await import("./verify_header.ts")).default;

  await t.step("providing no header fails", async () => {
    const response = await fetch("/");

    assertStatus(response, 403);

    const body = await response.text();
    assertEquals(body, "You are not welcome here");
  });

  await t.step("providing an invalid header fails", async () => {
    const response = await fetch("/", {
      headers: {
        "X-Access-Token": "this-is-not-the-token",
      },
    });

    assertStatus(response, 403);

    const body = await response.text();
    assertEquals(body, "You are not welcome here");
  });

  await t.step("providing a valid header succeeds", async () => {
    const response = await fetch("/", {
      headers: {
        "X-Access-Token": "super-secret-token",
      },
    });

    assertStatus(response, 200);

    const body = await response.text();
    assertEquals(body, "You have access");
  });
});
