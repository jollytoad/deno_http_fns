import { badRequest } from "@http/response/bad-request";

/**
 * Obtain a header from a Request, throwing a "Bad Request" Response if not present.
 *
 * @param header the name of the header
 * @returns the header value
 * @throws a Response with a Bad Request status if the header is not present or empty
 */
export function requiredHeader(
  req: Request,
  header: string,
): string | never {
  const value = req.headers.get(header);

  if (!value) {
    throw badRequest(`Missing ${header} header`);
  }

  return value;
}
