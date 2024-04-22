import { AssertionError } from "@std/assert/assertion-error";

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
