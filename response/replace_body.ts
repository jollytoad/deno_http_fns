/**
 * Duplicate the given Response, replacing its body with the given body.
 */
export function replaceBody(res: Response, body: BodyInit | null) {
  return res.body === body ? res : new Response(body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}
