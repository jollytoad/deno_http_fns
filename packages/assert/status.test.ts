import { assertStatus, STATUS_CODE } from "./status.ts";
import { assertThrows } from "@std/assert/throws";
import { AssertionError } from "@std/assert/assertion-error";

Deno.test("assertStatus() matches status code and text", () => {
  assertStatus(new Response(null, { status: 200, statusText: "OK" }), 200);
});

Deno.test("assertStatus() throws status code doesn't match", () => {
  assertThrows(
    () => {
      assertStatus(new Response(null, { status: 500 }), 200);
    },
    AssertionError,
    "Expected response status",
  );
});

Deno.test("assertStatus() throws if status text doesn't match the expected value for the code", () => {
  assertThrows(
    () => {
      assertStatus(
        new Response(null, { status: 200, statusText: "Alrighty" }),
        STATUS_CODE.OK,
      );
    },
    AssertionError,
    undefined,
    `"Expected response status "200 OK", got "200 Alrighty"`,
  );
});
