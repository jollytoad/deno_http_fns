export function getUrlHeader(
  header: string,
  trailing?: "/",
): (req: Request) => URL | undefined {
  return (req) => {
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
  };
}
