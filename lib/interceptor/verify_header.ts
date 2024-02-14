import { forbidden } from "../response/forbidden.ts";
import type { Awaitable } from "../types.ts";

export interface VerifyHeaderOptions {
  /**
   * The header name (or names) to verify
   */
  header: string | string[];

  /**
   * The possible valid value (or values) of the header
   */
  value?: string | string[];

  /**
   * The function to call should a given header not match one of the given values.
   * Defaults to `forbidden()`.
   */
  reject?: (req: Request) => Awaitable<Response>;
}

/**
 * Create a RequestInterceptor that verifies that a given header matches an expected value.
 */
export function verifyHeader(opts: VerifyHeaderOptions) {
  const headerNames = Array.isArray(opts.header) ? opts.header : [opts.header];
  const expectedValues = opts.value
    ? new Set(Array.isArray(opts.value) ? opts.value : [opts.value])
    : undefined;

  return (req: Request) => {
    if (expectedValues) {
      for (const headerName of headerNames) {
        const value = req.headers.get(headerName);

        if (value && expectedValues.has(value)) {
          return req;
        }
      }

      return opts.reject ? opts.reject(req) : forbidden();
    }
  };
}
