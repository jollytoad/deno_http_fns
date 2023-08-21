import { byPattern } from "./pattern.ts";
import { ok } from "./response/ok.ts";
import { assertInstanceOf } from "https://deno.land/std@0.198.0/assert/assert_instance_of.ts";

Deno.test("byPattern with '/' pattern matches URL with no path or trailing slash", async () => {
  await assertByPatternMatches("/", "http://example.com");
});

async function assertByPatternMatches(pattern: string, url: string) {
  const handler = byPattern(pattern, () => ok());
  const response = await handler(new Request(url));
  assertInstanceOf(response, Response);
}
