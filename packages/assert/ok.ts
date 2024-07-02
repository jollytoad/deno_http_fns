import { AssertionError } from "@std/assert/assertion-error";

/**
 * Assert that a Response is `ok`.
 *
 * @param response the Response object to test
 * @throws an AssertionError if the `ok` property of the Response was not true
 *
 * @example
 * ```ts
 * import { assertOk } from "@http/assert";
 *
 * assertOk(new Response());
 * ```
 */
export function assertOk(response: Response) {
  if (!response.ok) {
    throw new AssertionError(
      `Expected response ok, got status: "${response.status} ${response.statusText}"`,
    );
  }
}
