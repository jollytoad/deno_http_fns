export * from "jsr:@std/assert";
export { STATUS_CODE } from "jsr:@std/http/status";

import { AssertionError } from "jsr:@std/assert/assertion_error";

export function assertOk(response: Response) {
  if (!response.ok) {
    throw new AssertionError(
      `Expected response ok, got status: ${response.status} ${response.statusText}`,
    );
  }
}

export function assertStatus(
  response: Response,
  expectedStatus: number,
) {
  if (response.status !== expectedStatus) {
    throw new AssertionError(
      `Expected response status "${expectedStatus}", got "${response.status} ${response.statusText}"`,
    );
  }
}

export function assertHeader(
  response: Response,
  headerName: string,
  expectedValue: string,
) {
  if (!response.headers.has(headerName)) {
    throw new AssertionError(
      `Expected response header "${headerName}" with value "${expectedValue}", but header not present`,
    );
  }

  const actualValue = response.headers.get(headerName);
  if (actualValue !== expectedValue) {
    throw new AssertionError(
      `Expected response header "${headerName}" with value "${expectedValue}", got: "${actualValue}"`,
    );
  }
}
