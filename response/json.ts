export function json(body: unknown, headersInit?: HeadersInit): Response {
  const headers = new Headers(headersInit);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(body), {
    status: 200,
    statusText: "OK",
    headers,
  });
}
