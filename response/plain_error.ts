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
