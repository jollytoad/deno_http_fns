export function unauthorized(challenge: string): Response {
  return new Response(null, {
    status: 401,
    statusText: "Unauthorized",
    headers: {
      "WWW-Authenticate": challenge,
    },
  });
}
