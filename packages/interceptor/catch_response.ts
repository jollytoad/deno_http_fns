/**
 * An error interceptor that will catch and return any thrown Responses, any other type of error is ignored.
 *
 * This allows any interceptor or handler to simply throw a Response if it needs to reject a request quickly,
 * very handy for enforcing security measures in a succinct manner.
 *
 * @example
 * ```ts
 * function handler(req: Request) {
 *   enforceTheLaw(req);
 *
 *   // continue with request here...
 * }
 *
 * function enforceTheLaw(req: Request) {
 *   if (isThisAnIllegalOperation(req)) {
 *     throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
 *   }
 * }
 *
 * Deno.serve(intercept(handler, { error: catchResponse }));
 * ```
 *
 * @param error the error to handle
 * @returns the error if it is a Response otherwise void (ie. the error wasn't handled)
 */
export function catchResponse(
  _req: Request,
  _res: unknown,
  error: unknown,
): Response | undefined {
  if (error instanceof Response) {
    return error;
  }
}
