import { badRequest } from "../response/bad_request.ts";

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
