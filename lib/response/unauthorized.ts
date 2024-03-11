/**
 * Create a `401 Unauthorized` response
 *
 * @param challenge The value for the mandatory `WWW-Authenticate` header
 */
export function unauthorized(challenge: string): Response {
  return new Response(null, {
    status: 401,
    statusText: "Unauthorized",
    headers: {
      "WWW-Authenticate": challenge,
    },
  });
}
