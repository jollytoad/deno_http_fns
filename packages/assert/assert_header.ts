import { AssertionError } from "@std/assert/assertion-error";

/**
 * Assert that a HTTP header is present with an expected value.
 *
 * @param container a Request, Response, or Headers object
 * @param headerName the header name
 * @param expectedValue the value expected in the header
 * @throws an AssertionError if the header is missing or its value is not exactly equal to the expected value
 *
 * @example
 * ```ts
 * import { assertHeader } from "@http/assert";
 *
 * const resp = new Response(null, {
 *   headers: {
 *     "Content-Type": "application/json"
 *   }
 * });
 *
 * assertHeader(resp, "Content-Type", "application/json");
 * ```
 */
export function assertHeader(
  container: Response | Request | Headers,
  headerName: string,
  expectedValue: string,
) {
  const headers = container instanceof Headers ? container : container.headers;
  if (!headers.has(headerName)) {
    throw new AssertionError(
      `Expected header "${headerName}" with value "${expectedValue}", but header not present`,
    );
  }

  const actualValue = headers.get(headerName);
  if (actualValue !== expectedValue) {
    throw new AssertionError(
      `Expected header "${headerName}" with value "${expectedValue}", got: "${actualValue}"`,
    );
  }
}
