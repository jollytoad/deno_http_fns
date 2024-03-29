import { ok } from "https://deno.land/x/http_fns/lib/response/ok.ts";

export default function (_req: Request, match: URLPatternResult) {
  return ok(`Hello ${match.pathname.groups.name}`);
}
