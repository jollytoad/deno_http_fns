export function noContent(headers?: HeadersInit): Response {
  return new Response(null, {
    status: 204,
    statusText: "No Content",
    headers,
  });
}
