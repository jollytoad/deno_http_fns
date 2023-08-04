export function getSearchValues(
  input: Request | URL | URLPatternResult | URLSearchParams,
) {
  const searchParams = input instanceof Request
    ? new URL(input.url).searchParams
    : input instanceof URL
    ? input.searchParams
    : input instanceof URLSearchParams
    ? input
    : input && "search" in input && "input" in input.search
    ? new URLSearchParams(input.search.input)
    : undefined;

  return (param: string, separator?: string) => {
    return searchParams
      ? separator
        ? searchParams.getAll(param).join(separator).split(separator).filter(
          (v) => v !== "",
        )
        : searchParams.getAll(param)
      : [];
  };
}
