import { getRequest, requestContext } from "./request_context.ts";
import { intercept } from "./intercept.ts";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { assertThrows } from "@std/assert/throws";

Deno.test("requestContext and getRequest", async () => {
  const initialRequest = new Request("http://localhost");
  let foundRequest: Request | undefined;

  const handler = async () => {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        foundRequest = getRequest();
        resolve();
      }, 1);
    });
    return new Response();
  };

  await intercept(handler, requestContext())(initialRequest);

  assertStrictEquals(foundRequest, initialRequest);
});

Deno.test("getRequest throws if not with the request context", () => {
  assertThrows(
    () => {
      getRequest();
    },
    Error,
    "No Request found",
  );
});
