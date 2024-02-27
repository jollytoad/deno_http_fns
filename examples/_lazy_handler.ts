import { ok } from "@http/fns/response/ok.ts";

export default function (_req: Request) {
  return ok(`Lazy handler module`);
}
