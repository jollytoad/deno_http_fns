import { STATUS_TEXT, type StatusCode } from "@std/http/status";
import { AssertionError } from "@std/assert/assertion-error";
export { STATUS_CODE, type StatusCode } from "@std/http/status";

/**
 * Assert that a Response has an expected status code and appropriate status text
 *
 * @param response the Response object to check
 * @param expectedStatus the expected HTTP status code
 * @throws an AssertionError if the status code or status text was not as expected
 *
 * @example
 * ```ts
 * import { assertStatus, STATUS_CODE } from "@http/assert";
 *
 * assertStatus(new Response(null, { status: 204, statusText: "No Content" }), STATUS_CODE.NoContent);
 * ```
 */
export function assertStatus(response: Response, expectedStatus: StatusCode) {
  const expectedStatusText = STATUS_TEXT[expectedStatus];
  if (
    response.status !== expectedStatus ||
    response.statusText !== expectedStatusText
  ) {
    throw new AssertionError(
      `Expected response status "${expectedStatus} ${expectedStatusText}", got "${response.status} ${response.statusText}"`,
    );
  }
}
