import { assertHeader } from "./assert_header.ts";
import { AssertionError } from "@std/assert/assertion-error";
import { assertThrows } from "@std/assert/assert-throws";

Deno.test("assertHeader() matches header with value in Headers object", () => {
  const headers = new Headers({ "Stuff": "Nonsense" });
  assertHeader(headers, "Stuff", "Nonsense");
});

Deno.test("assertHeader() matches header with value in Request object", () => {
  const request = new Request("http://example.com", {
    headers: { "Stuff": "Nonsense" },
  });
  assertHeader(request, "Stuff", "Nonsense");
});

Deno.test("assertHeader() matches header with value in Response object", () => {
  const response = new Response("http://example.com", {
    headers: { "Stuff": "Nonsense" },
  });
  assertHeader(response, "Stuff", "Nonsense");
});

Deno.test("assertHeader() matches header name case-insensitively", () => {
  const headers = new Headers({ "Stuff": "Nonsense" });
  assertHeader(headers, "stuFF", "Nonsense");
});

Deno.test("assertHeader() throws when header is missing", () => {
  const headers = new Headers({ "Not-Stuff": "Nonsense" });
  assertThrows(
    () => {
      assertHeader(headers, "Stuff", "Nonsense");
    },
    AssertionError,
    undefined,
    `Expected header "Stuff" with value "Nonsense", header not present`,
  );
});

Deno.test("assertHeader() throws when value is not equal", () => {
  const headers = new Headers({ "Stuff": "Nonsense" });
  assertThrows(
    () => {
      assertHeader(headers, "Stuff", "Sense");
    },
    AssertionError,
    undefined,
    `Expected header "Stuff" with value "Sense", got: "Nonsense"`,
  );
});
