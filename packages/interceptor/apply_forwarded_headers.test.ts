import { assertEquals } from "@std/assert/equals";
import { applyForwardedHeaders } from "./apply_forwarded_headers.ts";

Deno.test("x-forwarded", () => {
  const incomingBody = new ReadableStream();

  const incomingReq = new Request("http://localhost:8000/yeah?this=that", {
    method: "PUT",
    headers: {
      "X-Forwarded-Proto": "https",
      "X-Forwarded-Host": "something.cool",
      "X-Forwarded-Port": "443",
    },
    body: incomingBody,
  });

  const adjustedReq = applyForwardedHeaders(incomingReq);

  assertEquals(adjustedReq.url, "https://something.cool/yeah?this=that");
  assertEquals(adjustedReq.method, "PUT");
  assertEquals(adjustedReq.body, incomingBody);
});
