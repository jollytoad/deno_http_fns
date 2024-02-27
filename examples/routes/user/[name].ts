import { ok } from "@http/fns/response/ok.ts";

export default function (_req: Request, match: URLPatternResult) {
  return ok(`Hello ${match.pathname.groups.name}`);
}
