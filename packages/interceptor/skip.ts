/**
 * A ResponseInterceptor that will catch and skip any Responses that match the given Statuses.
 */
export function skip(
  ...status: number[]
): (req: Request, res: Response | null) => null | undefined {
  return (_req, res) => res && status.includes(res.status) ? null : undefined;
}
