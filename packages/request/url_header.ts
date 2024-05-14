/**
 * Obtain a valid URL from a request header.
 *
 * @param req the Request
 * @param header the header name
 * @param trailing whether the URL should end with a trailing slash, one is added if not present.
 * @returns a function that accepts the Request and returns a valid URL or undefined if not found or invalid
 */
export function getUrlHeader(
  req: Request,
  header: string,
  trailing?: "/",
): URL | undefined {
  const value = req.headers.get(header);

  try {
    const url = value ? new URL(value) : undefined;
    if (url && trailing && !url.pathname.endsWith(trailing)) {
      url.pathname += trailing;
    }
    return url;
  } catch (e) {
    console.warn(`Invalid ${header} header, expected an absolute URL`, e);
  }

  return undefined;
}
