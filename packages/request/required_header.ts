import { badRequest } from "@http/response/bad-request";

export function requiredHeader(
  header: string,
): (req: Request) => string | never {
  return (req) => {
    const value = req.headers.get(header);

    if (!value) {
      throw badRequest(`Missing ${header} header`);
    }

    return value;
  };
}
