/**
 * Create a plain text error response
 *
 * @param status HTTP status code
 * @param statusText HTTP status text
 * @param message An optional message for the body of the response
 */
export function plainError(
  status: number,
  statusText: string,
  message?: string,
): Response {
  return new Response(message ?? statusText, {
    status,
    statusText,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
