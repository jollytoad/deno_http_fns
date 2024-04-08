import { ok } from "@http/response/ok";

export default function (_req: Request) {
  return ok(`Lazy handler module`);
}
