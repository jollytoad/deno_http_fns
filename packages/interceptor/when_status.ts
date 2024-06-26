import type { ResponseInterceptor } from "./types.ts";

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
export function whenStatus(
  status: number | number[],
  interceptor: ResponseInterceptor,
): ResponseInterceptor {
  return (req, res) => {
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
