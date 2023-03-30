import * as c from "https://deno.land/std@0.181.0/fmt/colors.ts";

/**
 * A RequestInterceptor that logs the Requests (using console.group),
 * can be passed a `pre` interceptor to `intercept`.
 *
 * This should be paired with a `logGroupEnd` in the `post` and `error`
 * chains of the same `intercept` function.
 */
export const logRequestGroup = (req: Request) => {
  console.group(
    c.brightYellow("►"),
    c.brightYellow(req.method),
    c.bold(c.brightCyan(req.url)),
  );
};

/**
 * A RequestInterceptor that logs the Request Headers.
 */
export const logHeaders = (req: Request) => {
  console.debug(req.headers);
};

/**
 * A ResponseInterceptor that logs the Response Headers.
 */
export const logResponseHeaders = (_req: unknown, res: Response) => {
  res && console.debug(res.headers);
};

/**
 * An interceptor that simply closes a log group (using console.groupEnd),
 * that was started by `logRequestGroup`.
 */
export const logGroupEnd = () => {
  console.groupEnd();
};

/**
 * A ResponseInterceptor that logs the Response Status and Content-Type header.
 */
export const logStatusAndContentType = (_req: unknown, res: Response) => {
  if (res) {
    const clr = res.ok || res.status === 304 ? c.brightGreen : c.brightRed;
    console.debug(
      clr(`◁ ${res.status} ${res.statusText}`),
      c.gray(res.headers.get("Content-Type") || ""),
    );
  }
};

/**
 * A ErrorInterceptor that simply logs the error.
 */
export const logError = (_req: unknown, _res: unknown, error: unknown) => {
  console.error(error);
};
