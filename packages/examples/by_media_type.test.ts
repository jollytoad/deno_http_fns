import { assertEquals, assertStringIncludes } from "@std/assert";
import {
  assertHeader,
  assertOk,
  assertStatus,
  STATUS_CODE,
} from "@http/assert";
import { getBaseUrl } from "./_base_url.ts";

Deno.test("by_media_type", async (t) => {
  await using server = (await import("./by_media_type.ts")).default;
  const baseUrl = getBaseUrl(server);

  await t.step("/hello", async () => {
    const response = await fetch(`${baseUrl}/hello`);

    assertOk(response);
    assertHeader(response, "Content-Type", "text/plain;charset=UTF-8");
    assertEquals(await response.text(), "Hello world");
  });

  await t.step("/hello.txt", async () => {
    const response = await fetch(`${baseUrl}/hello.txt`);

    assertOk(response);
    assertHeader(response, "Content-Type", "text/plain;charset=UTF-8");
    assertEquals(await response.text(), "Hello world");
  });

  await t.step("/hello.html", async () => {
    const response = await fetch(`${baseUrl}/hello.html`);

    assertOk(response);
    assertHeader(response, "Content-Type", "text/html");
    assertStringIncludes(await response.text(), "<h1>Hello world</h1>");
  });

  await t.step("/hello.json", async () => {
    const response = await fetch(`${baseUrl}/hello.json`);

    assertOk(response);
    assertHeader(response, "Content-Type", "application/json");
    assertStringIncludes(await response.json(), "Hello world");
  });

  await t.step("/hello.md (404)", async () => {
    const response = await fetch(`${baseUrl}/hello.md`);

    assertStatus(response, STATUS_CODE.NotFound);
    await response.body?.cancel();
  });

  await t.step("Accept: text/plain", async () => {
    const response = await fetch(`${baseUrl}/hello`, {
      headers: { Accept: "text/plain" },
    });

    assertOk(response);
    assertHeader(response, "Content-Type", "text/plain;charset=UTF-8");
    assertEquals(await response.text(), "Hello world");
  });

  await t.step("Accept: text/html", async () => {
    const response = await fetch(`${baseUrl}/hello`, {
      headers: { Accept: "text/html" },
    });

    assertOk(response);
    assertHeader(response, "Content-Type", "text/html");
    assertStringIncludes(await response.text(), "<h1>Hello world</h1>");
  });

  await t.step("Accept: application/json", async () => {
    const response = await fetch(`${baseUrl}/hello`, {
      headers: { Accept: "application/json" },
    });

    assertOk(response);
    assertHeader(response, "Content-Type", "application/json");
    assertStringIncludes(await response.json(), "Hello world");
  });

  await t.step("Accept: text/markdown (406)", async () => {
    const response = await fetch(`${baseUrl}/hello`, {
      headers: { Accept: "text/markdown" },
    });

    assertStatus(response, STATUS_CODE.NotAcceptable);
    await response.body?.cancel();
  });
});
