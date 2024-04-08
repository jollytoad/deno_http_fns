export function getSearchValues(
  input: Request | URL | URLPatternResult | URLSearchParams,
): (param: string, separator?: string) => string[] {
  const searchParams = input instanceof Request
    ? new URL(input.url).searchParams
    : input instanceof URL
    ? input.searchParams
    : input instanceof URLSearchParams
    ? input
    : input && "search" in input && "input" in input.search
    ? new URLSearchParams(input.search.input)
    : undefined;

  return (param, separator) =>
    searchParams
      ? separator
        ? searchParams.getAll(param).join(separator).split(separator).filter(
          (v) => v !== "",
        )
        : searchParams.getAll(param)
      : [];
}
