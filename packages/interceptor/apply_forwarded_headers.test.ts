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

Deno.test("x-forwarded-host uses the leftmost value of a comma-joined list", () => {
  const incomingReq = new Request("http://localhost:8000/foo", {
    headers: {
      "X-Forwarded-Proto": "https",
      "X-Forwarded-Host": "somewhere.cool, browser-host.example.com",
      "X-Forwarded-Port": "443",
    },
  });
  const adjustedReq = applyForwardedHeaders(incomingReq);

  assertEquals(adjustedReq.url, "https://somewhere.cool/foo");
});

Deno.test("x-forwarded-port does not override a port already in x-forwarded-host", () => {
  const incomingReq = new Request("http://localhost:8000/foo", {
    headers: {
      "X-Forwarded-Proto": "https",
      "X-Forwarded-Host": "somewhere.cool:8443",
      "X-Forwarded-Port": "80",
    },
  });
  const adjustedReq = applyForwardedHeaders(incomingReq);

  assertEquals(adjustedReq.url, "https://somewhere.cool:8443/foo");
});

Deno.test("x-forwarded-port fills in when the forwarded host carries no port", () => {
  const incomingReq = new Request("http://localhost:8000/foo", {
    headers: {
      "X-Forwarded-Proto": "https",
      "X-Forwarded-Host": "somewhere.cool",
      "X-Forwarded-Port": "8443",
    },
  });
  const adjustedReq = applyForwardedHeaders(incomingReq);

  assertEquals(adjustedReq.url, "https://somewhere.cool:8443/foo");
});
