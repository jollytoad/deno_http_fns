import { ok } from "@http/response/ok";

export default function (_req: Request, match: URLPatternResult) {
  return ok(`Hello ${match.pathname.groups.name}`);
}
