import { ok } from "https://deno.land/x/http_fns/response/ok.ts";

export default function () {
  return ok("This is the index page");
}
