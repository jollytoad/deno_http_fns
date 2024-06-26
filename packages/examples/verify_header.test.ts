import { assertEquals } from "@std/assert";
import { assertStatus, STATUS_CODE } from "@http/assert";
import { getBaseUrl } from "./_base_url.ts";

Deno.test("verifyHeader", async (t) => {
  await using server = (await import("./verify_header.ts")).default;
  const baseUrl = getBaseUrl(server);

  await t.step("providing no header fails", async () => {
    const response = await fetch(`${baseUrl}/`);

    assertStatus(response, STATUS_CODE.Forbidden);

    const body = await response.text();
    assertEquals(body, "You are not welcome here");
  });

  await t.step("providing an invalid header fails", async () => {
    const response = await fetch(`${baseUrl}/`, {
      headers: {
        "X-Access-Token": "this-is-not-the-token",
      },
    });

    assertStatus(response, STATUS_CODE.Forbidden);

    const body = await response.text();
    assertEquals(body, "You are not welcome here");
  });

  await t.step("providing a valid header succeeds", async () => {
    const response = await fetch(`${baseUrl}/`, {
      headers: {
        "X-Access-Token": "super-secret-token",
      },
    });

    assertStatus(response, STATUS_CODE.OK);

    const body = await response.text();
    assertEquals(body, "You have access");
  });
});
