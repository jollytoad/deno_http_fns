/**
 * Duplicate the given Response, replacing its body with the given body.
 *
 * @param res A Response
 * @param body A new body for the Response
 * @return A new Response with the new body and same headers, or the same
 *   Response if the given body was strictly equal to the existing body.
 */
export function replaceBody(res: Response, body: BodyInit | null): Response {
  return res.body === body ? res : new Response(body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}
