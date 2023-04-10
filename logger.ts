import * as c from "https://deno.land/std@0.182.0/fmt/colors.ts";

/**
 * A RequestInterceptor that logs the Requests (using console.group),
 * can be passed a `pre` interceptor to `intercept`.
 *
 * This should be paired with a `logGroupEnd` in the `post` and `error`
 * chains of the same `intercept` function.
 */
export function logRequestGroup(req: Request) {
  console.group(
    c.brightYellow("►"),
    c.brightYellow(req.method),
    c.bold(c.brightCyan(req.url)),
  );
}

/**
 * A RequestInterceptor that logs the Request Headers.
 */
export function logHeaders(req: Request) {
  console.debug(req.headers);
}

/**
 * A ResponseInterceptor that logs the Response Headers.
 */
export function logResponseHeaders(_req: unknown, res: Response) {
  res && console.debug(res.headers);
}

/**
 * An interceptor that simply closes a log group (using console.groupEnd),
 * that was started by `logRequestGroup`.
 */
export function logGroupEnd() {
  console.groupEnd();
}

/**
 * A ResponseInterceptor that logs the Response Status and Content-Type header.
 */
export function logStatusAndContentType(_req: unknown, res: Response) {
  if (res) {
    const clr = res.ok || res.status === 304 ? c.brightGreen : c.brightRed;
    console.debug(
      clr(`◁ ${res.status} ${res.statusText}`),
      c.gray(res.headers.get("Content-Type") || ""),
    );
  }
}

/**
 * A ErrorInterceptor that simply logs the error.
 */
export function logError(_req: unknown, _res: unknown, error: unknown) {
  console.error(error);
}
