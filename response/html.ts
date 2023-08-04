export function html(body: BodyInit, headersInit?: HeadersInit): Response {
  const headers = new Headers(headersInit);
  headers.set("Content-Type", "text/html");
  return new Response(body, {
    status: 200,
    statusText: "OK",
    headers,
  });
}
