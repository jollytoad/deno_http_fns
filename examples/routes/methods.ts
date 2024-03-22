import { ok } from "@http/fns/response/ok";

export function GET(_req: Request) {
  return ok(`GET method`);
}

export function PUT(_req: Request) {
  return ok(`PUT method`);
}

export function POST(_req: Request) {
  return ok(`POST method`);
}
