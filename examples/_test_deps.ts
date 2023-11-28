export * from "https://deno.land/std@0.208.0/assert/mod.ts";
export { STATUS_CODE } from "https://deno.land/std@0.208.0/http/status.ts";

import { AssertionError } from "https://deno.land/std@0.208.0/assert/assertion_error.ts";

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
