import { AssertionError } from "@std/assert/assertion-error";

export function assertOk(response: Response) {
  if (!response.ok) {
    throw new AssertionError(
      `Expected response ok, got status: "${response.status} ${response.statusText}"`,
    );
  }
}
