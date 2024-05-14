/**
 * Obtain the values of a search parameter from a URL or Request.
 *
 * @param input a URL or object containing a URL, such as a Request
 * @returns a function to obtain values of a named parameter, optionally splitting on a separator
 */
export function getSearchValues(
  input: Request | URL | URLPatternResult | URLSearchParams,
  param: string,
  separator?: string,
): string[] {
  const searchParams = input instanceof Request
    ? new URL(input.url).searchParams
    : input instanceof URL
    ? input.searchParams
    : input instanceof URLSearchParams
    ? input
    : input && "search" in input && "input" in input.search
    ? new URLSearchParams(input.search.input)
    : undefined;

  return searchParams
    ? separator
      ? searchParams.getAll(param).join(separator).split(separator).filter(
        (v) => v !== "",
      )
      : searchParams.getAll(param)
    : [];
}
