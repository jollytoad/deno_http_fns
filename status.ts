import type { Awaitable } from "./types.ts";

/**
 * Create a Response Interceptor that matches the status of the Response.
 *
 * @param status one or many HTTP status codes to match against the Response
 * @param interceptor called if the status matches, it should
 *  take the Request and Response as arguments, and return a Response,
 *  or void/undefined to pass the Response through as is, or
 *  null to indicate a skipped response.
 * @returns a Response Interceptor
 */
export function byStatus(
  status: number | number[],
  interceptor: (
    request: Request,
    response: Response | null,
  ) => Awaitable<Response | null | void>,
) {
  return (req: Request, res: Response | null) => {
    if (
      res &&
      (Array.isArray(status)
        ? status.includes(res.status)
        : status === res.status)
    ) {
      return interceptor(req, res);
    }
  };
}
