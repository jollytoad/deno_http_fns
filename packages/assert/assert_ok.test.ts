import { assertOk } from "./assert_ok.ts";
import { assertThrows } from "@std/assert/assert-throws";
import { AssertionError } from "@std/assert/assertion-error";

Deno.test("assertOk() matches when response.ok is true", () => {
  assertOk(new Response());
});

Deno.test("assertOk() throws when response.ok is false", () => {
  assertThrows(
    () => {
      assertOk(new Response(null, { status: 500 }));
    },
    AssertionError,
    "Expected response ok",
  );
});

Deno.test("assertOk() thrown error includes status code and text", () => {
  assertThrows(
    () => {
      assertOk(
        new Response(null, { status: 599, statusText: "Naughty naughty" }),
      );
    },
    AssertionError,
    "599 Naughty naughty",
  );
});
