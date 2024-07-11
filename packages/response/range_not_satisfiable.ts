/**
 * Create a `416 Range Not Satisfiable` response
 *
 * @param headers Optional headers, these should include a 'Content-Range' header
 */
export function rangeNotSatisfiable(headers?: HeadersInit): Response {
  return new Response(null, {
    status: 416,
    statusText: "Range Not Satisfiable",
    headers,
  });
}
