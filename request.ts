import { errorResponse } from "./response.ts";

export function requiredHeader(header: string, status = 400) {
  return (req: Request): string | never => {
    const value = req.headers.get(header);

    if (!value) {
      throw errorResponse(`Missing ${header} header`, status);
    }

    return value;
  };
}

export function getUrlHeader(header: string, trailing?: "/") {
  return (req: Request): URL | undefined => {
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

export async function getBodyAsObject<T>(
  req: Request,
  processForm?: (data: Record<string, FormDataEntryValue>, form: FormData) => T,
): Promise<T> | never {
  const contentType = req.headers.get("content-type");

  let body;

  switch (contentType) {
    case "application/json":
      try {
        body = await req.json();
      } catch (e) {
        throw errorResponse(`Invalid request body: ${e.message}`);
      }
      if (!body || typeof body !== "object") {
        throw errorResponse(
          `Invalid request body: JSON object or array expected`,
        );
      }
      break;

    case "application/x-www-form-urlencoded":
    case "multipart/form-data":
      try {
        const form = await req.formData();
        body = Object.fromEntries(form.entries());
        if (processForm) {
          body = processForm(body, form);
        }
      } catch (e) {
        throw errorResponse(`Invalid request body: ${e.message}`);
      }
      break;

    default:
      throw errorResponse(`Unexpected request content-type: ${contentType}`);
  }

  return body;
}

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
