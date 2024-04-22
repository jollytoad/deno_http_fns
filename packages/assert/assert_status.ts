import { STATUS_TEXT, type StatusCode } from "@std/http/status";
import { AssertionError } from "@std/assert/assertion-error";
export { STATUS_CODE } from "@std/http/status";

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
