import { assertEquals } from "@std/assert";
import { ok } from "@http/response/ok";
import { byMethod } from "./by_method.ts";

const GET = () => ok("GET");
const POST = () => ok("POST");
const PUT = () => ok("PUT");

function request(method: string, url = "http://example.com/hello"): Request {
  return new Request(url, { method });
}

Deno.test("byMethod unsupported method returns 405", async () => {
  const handler = byMethod({ GET });
  const response = await handler(request("POST"));
  assertEquals(response?.status, 405);
});

Deno.test("byMethod 405 includes Allow header", async () => {
  const handler = byMethod({ GET });
  const response = await handler(request("POST"));
  assertEquals(response?.headers.get("Allow"), "GET, HEAD, OPTIONS");
});

Deno.test("byMethod Allow reflects declared methods plus implicit HEAD/OPTIONS", async () => {
  const handler = byMethod({ GET, PUT });
  const response = await handler(request("DELETE"));
  assertEquals(response?.headers.get("Allow"), "GET, PUT, HEAD, OPTIONS");
});

Deno.test("byMethod Allow when no GET handler (no implicit HEAD)", async () => {
  const handler = byMethod({ POST, PUT });
  const response = await handler(request("GET"));
  assertEquals(response?.headers.get("Allow"), "POST, PUT, OPTIONS");
});

Deno.test("byMethod OPTIONS still includes Allow (no regression)", async () => {
  const handler = byMethod({ GET, PUT });
  const response = await handler(request("OPTIONS"));
  assertEquals(response?.headers.get("Allow"), "GET, PUT, HEAD, OPTIONS");
});

Deno.test("byMethod custom fallback is still honored", async () => {
  const handler = byMethod({ GET }, () => null);
  const response = await handler(request("POST"));
  assertEquals(response, null);
});
