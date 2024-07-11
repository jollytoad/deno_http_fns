/**
 * Check whether an error is a file not found
 */
export function fileNotFound(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
