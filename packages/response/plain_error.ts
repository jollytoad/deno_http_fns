/**
 * Create a plain text error response
 *
 * @param status HTTP status code
 * @param statusText HTTP status text
 * @param message An optional message for the body of the response
 * @param headers An optional headers init
 */
export function plainError(
  status: number,
  statusText: string,
  message?: string,
  headers?: HeadersInit,
): Response {
  return new Response(message ?? statusText, {
    status,
    statusText,
    headers: {
      "Content-Type": "text/plain",
      ...headers,
    },
  });
}
