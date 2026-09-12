import { assertEquals } from "@std/assert";
import { addCorsHeaders } from "./cors.ts";

Deno.test("addCorsHeaders echoes exact Origin for allowed wildcard origin", () => {
  const res = addCorsHeaders({ allowOrigin: "*" })(
    new Request("http://localhost:8000/foo", {
      headers: { Origin: "https://example.com" },
    }),
    new Response(null, { status: 204 }),
  );
  assertEquals(
    res.headers.get("Access-Control-Allow-Origin"),
    "https://example.com",
  );
});

Deno.test("addCorsHeaders echoes exact Origin for allowed listed origin", () => {
  const res = addCorsHeaders({ allowOrigin: ["https://example.com"] })(
    new Request("http://localhost:8000/foo", {
      headers: { Origin: "https://example.com" },
    }),
    new Response(null, { status: 204 }),
  );
  assertEquals(
    res.headers.get("Access-Control-Allow-Origin"),
    "https://example.com",
  );
});

Deno.test("addCorsHeaders respects a handler-set Allow-Origin value", () => {
  const res = addCorsHeaders()(
    new Request("http://localhost:8000/foo", {
      headers: { Origin: "https://example.com" },
    }),
    new Response(null, {
      status: 204,
      headers: { "Access-Control-Allow-Origin": "https://other.com" },
    }),
  );
  assertEquals(
    res.headers.get("Access-Control-Allow-Origin"),
    "https://other.com",
  );
});

Deno.test("addCorsHeaders appends Vary Origin without clobbering existing Vary", () => {
  const res = addCorsHeaders()(
    new Request("http://localhost:8000/foo", {
      headers: { Origin: "https://example.com" },
    }),
    new Response(null, {
      status: 200,
      headers: { "Vary": "Accept" },
    }),
  );
  assertEquals(res.headers.get("Vary"), "Accept, Origin");
});

Deno.test("addCorsHeaders appends Vary Origin even when origin not allowed", () => {
  const res = addCorsHeaders({ allowOrigin: ["https://good.com"] })(
    new Request("http://localhost:8000/foo", {
      headers: { Origin: "https://example.com" },
    }),
    new Response(null, { status: 204 }),
  );
  assertEquals(res.headers.get("Vary"), "Origin");
});

Deno.test("addCorsHeaders expands Allow-Methods from the Allow header on preflight", () => {
  const res = addCorsHeaders({ allowMethods: "*" })(
    new Request("http://localhost:8000/foo", {
      method: "OPTIONS",
      headers: {
        Origin: "https://example.com",
        "Access-Control-Request-Method": "PUT",
      },
    }),
    new Response(null, {
      status: 204,
      headers: { "Allow": "GET, HEAD, OPTIONS" },
    }),
  );
  assertEquals(
    res.headers.get("Access-Control-Allow-Methods"),
    "GET, HEAD, OPTIONS",
  );
});

Deno.test("addCorsHeaders reflects allowed headers from request on preflight", () => {
  const res = addCorsHeaders({ allowHeaders: "*" })(
    new Request("http://localhost:8000/foo", {
      method: "OPTIONS",
      headers: {
        Origin: "https://example.com",
        "Access-Control-Request-Method": "PUT",
        "Access-Control-Request-Headers": "x-custom, content-type",
      },
    }),
    new Response(null, { status: 204 }),
  );
  assertEquals(
    res.headers.get("Access-Control-Allow-Headers"),
    "x-custom, content-type",
  );
});

// --- origin gating: reflects the exact allowed Origin and omits grants otherwise ---

Deno.test("addCorsHeaders omits Allow-Origin for an opaque (null) origin under wildcard", () => {
  const res = addCorsHeaders({ allowOrigin: "*" })(
    new Request("http://localhost:8000/foo", {
      headers: { Origin: "null" },
    }),
    new Response(null, { status: 204 }),
  );
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), null);
});

Deno.test("addCorsHeaders does not grant credentials to an opaque (null) origin under wildcard", () => {
  const res = addCorsHeaders({ allowOrigin: "*", allowCredentials: true })(
    new Request("http://localhost:8000/foo", {
      headers: { Origin: "null" },
    }),
    new Response(null, { status: 204 }),
  );
  assertEquals(res.headers.get("Access-Control-Allow-Credentials"), null);
});

Deno.test("addCorsHeaders omits Allow-Origin for a multi-origin Origin header", () => {
  const res = addCorsHeaders({ allowOrigin: "*" })(
    new Request("http://localhost:8000/foo", {
      headers: { Origin: "https://a.com https://b.com" },
    }),
    new Response(null, { status: 204 }),
  );
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), null);
});

Deno.test("addCorsHeaders omits CORS-truth headers from Access-Control-Expose-Headers", () => {
  const res = addCorsHeaders()(
    new Request("http://localhost:8000/foo", {
      headers: { Origin: "https://example.com" },
    }),
    new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://example.com",
        "Allow": "GET",
        "X-Custom": "1",
      },
    }),
  );
  assertEquals(res.headers.get("Access-Control-Expose-Headers"), "x-custom");
});

// --- behavior that already holds, strengthened for regression safety ---

Deno.test("addCorsHeaders omits Allow-Origin when the origin is not allowed", () => {
  const res = addCorsHeaders({ allowOrigin: ["https://good.com"] })(
    new Request("http://localhost:8000/foo", {
      headers: { Origin: "https://evil.com" },
    }),
    new Response(null, { status: 204 }),
  );
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), null);
});

Deno.test('addCorsHeaders honors an explicitly listed "null" origin', () => {
  const res = addCorsHeaders({ allowOrigin: ["null"] })(
    new Request("http://localhost:8000/foo", {
      headers: { Origin: "null" },
    }),
    new Response(null, { status: 204 }),
  );
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "null");
});

Deno.test("addCorsHeaders expands wildcard Allow-Methods only from the response Allow header", () => {
  const res = addCorsHeaders({ allowMethods: "*" })(
    new Request("http://localhost:8000/foo", {
      method: "OPTIONS",
      headers: {
        Origin: "https://example.com",
        "Access-Control-Request-Method": "PUT",
      },
    }),
    new Response(null, { status: 204 }),
  );
  assertEquals(res.headers.get("Access-Control-Allow-Methods"), "*");
});

Deno.test("addCorsHeaders omits grant headers when the origin is not allowed", () => {
  const res = addCorsHeaders({ allowOrigin: ["https://good.com"] })(
    new Request("http://localhost:8000/foo", {
      method: "OPTIONS",
      headers: {
        Origin: "https://evil.com",
        "Access-Control-Request-Method": "PUT",
      },
    }),
    new Response(null, {
      status: 204,
      headers: { "Allow": "GET, HEAD, OPTIONS" },
    }),
  );

  assertEquals(res.headers.get("Access-Control-Allow-Methods"), null);
  assertEquals(res.headers.get("Access-Control-Allow-Headers"), null);
});

Deno.test("addCorsHeaders treats OPTIONS without Access-Control-Request-Method as a plain CORS request", () => {
  const res = addCorsHeaders({ allowMethods: "*", allowHeaders: "*" })(
    new Request("http://localhost:8000/foo", {
      method: "OPTIONS",
      headers: { Origin: "https://example.com" },
    }),
    new Response(null, {
      status: 204,
      headers: { "Allow": "GET, HEAD, OPTIONS" },
    }),
  );

  assertEquals(res.headers.get("Access-Control-Allow-Methods"), null);
  assertEquals(res.headers.get("Access-Control-Allow-Headers"), null);
});

Deno.test("addCorsHeaders exposes non-safelisted response headers by default", () => {
  const res = addCorsHeaders()(
    new Request("http://localhost:8000/foo", {
      headers: { Origin: "https://example.com" },
    }),
    new Response(null, {
      status: 200,
      headers: { "X-Custom": "secret" },
    }),
  );

  assertEquals(res.headers.get("Access-Control-Expose-Headers"), "x-custom");
});

Deno.test("addCorsHeaders with credentials emits Access-Control-Allow-Credentials", () => {
  const res = addCorsHeaders(
    {
      allowOrigin: "*",
      allowCredentials: true,
    },
  )(
    new Request("http://localhost:8000/foo", {
      headers: { Origin: "https://example.com" },
    }),
    new Response(null, { status: 204 }),
  );

  assertEquals(res.headers.get("Access-Control-Allow-Credentials"), "true");
});

Deno.test("addCorsHeaders with credentials expands wildcard Allow-Methods instead of a literal asterisk", () => {
  const res = addCorsHeaders(
    {
      allowOrigin: "*",
      allowMethods: "*",
      allowCredentials: true,
    },
  )(
    new Request("http://localhost:8000/foo", {
      method: "OPTIONS",
      headers: {
        Origin: "https://example.com",
        "Access-Control-Request-Method": "PUT",
      },
    }),
    new Response(null, {
      status: 204,
      headers: { "Allow": "GET, HEAD, OPTIONS" },
    }),
  );

  assertEquals(
    res.headers.get("Access-Control-Allow-Methods"),
    "GET, HEAD, OPTIONS",
  );
});

Deno.test("addCorsHeaders with credentials expands wildcard Allow-Headers instead of a literal asterisk", () => {
  const res = addCorsHeaders(
    {
      allowHeaders: "*",
      allowCredentials: true,
    },
  )(
    new Request("http://localhost:8000/foo", {
      method: "OPTIONS",
      headers: {
        Origin: "https://example.com",
        "Access-Control-Request-Method": "PUT",
        "Access-Control-Request-Headers": "x-custom, content-type",
      },
    }),
    new Response(null),
  );

  assertEquals(
    res.headers.get("Access-Control-Allow-Headers"),
    "x-custom, content-type",
  );
});
