import { assertEquals, assertRejects, assertStrictEquals } from "@std/assert";
import { onResponseComplete } from "./on_response_complete.ts";

Deno.test("onResponseComplete fires onComplete for a response with no body", async () => {
  let calls = 0;
  const observed = onResponseComplete(new Response(), () => {
    calls++;
  });
  assertEquals(calls, 0, "should not fire synchronously");
  await Promise.resolve();
  assertEquals(calls, 1, "should fire on next microtask");
  assertEquals(observed.body, null);
});

Deno.test("onResponseComplete fires onComplete once the body is fully read", async () => {
  let calls = 0;
  let reason: unknown;
  const observed = onResponseComplete(
    new Response("hello world"),
    (r) => {
      calls++;
      reason = r;
    },
  );
  assertEquals(calls, 0, "should not fire before body is read");
  const text = await observed.text();
  assertEquals(text, "hello world");
  // The microtask drained the body, flush fires, then the callback runs.
  await Promise.resolve();
  assertEquals(calls, 1, "should fire exactly once after body is read");
  assertStrictEquals(reason, undefined);
});

Deno.test("onResponseComplete fires onComplete once the body is fully read (stream body)", async () => {
  let calls = 0;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array([1, 2, 3]));
      controller.enqueue(new Uint8Array([4, 5, 6]));
      controller.close();
    },
  });
  const observed = onResponseComplete(
    new Response(stream),
    () => {
      calls++;
    },
  );
  // Drain the body.
  await observed.arrayBuffer();
  await Promise.resolve();
  assertEquals(calls, 1);
});

Deno.test("onResponseComplete fires onComplete with the error reason on body error", async () => {
  let calls = 0;
  let reason: unknown;
  const err = new Error("boom");
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.error(err);
    },
  });
  const observed = onResponseComplete(
    new Response(stream),
    (r) => {
      calls++;
      reason = r;
    },
  );
  await assertRejects(() => observed.arrayBuffer());
  // The pipeTo rejection surfaces on a microtask.
  await Promise.resolve();
  await Promise.resolve();
  assertEquals(calls, 1, "should fire exactly once on error");
  assertStrictEquals(reason, err);
});

Deno.test("onResponseComplete fires onComplete when the body is cancelled", async () => {
  let calls = 0;
  let reason: unknown;
  const observed = onResponseComplete(
    new Response("hi"),
    (r) => {
      calls++;
      reason = r;
    },
  );
  await observed.body!.cancel("client gave up");
  // Give the pipeTo rejection a microtask to surface.
  await Promise.resolve();
  await Promise.resolve();
  assertEquals(calls, 1, "should fire exactly once on cancel");
  // The reason passed to cancel() is propagated through pipeTo's rejection.
  assertEquals(reason, "client gave up");
});

Deno.test("onResponseComplete is idempotent across many reads and an error", async () => {
  let calls = 0;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array([1]));
      controller.error(new Error("nope"));
    },
  });
  const observed = onResponseComplete(
    new Response(stream),
    () => {
      calls++;
    },
  );
  await assertRejects(() => observed.arrayBuffer());
  await Promise.resolve();
  await Promise.resolve();
  // Multiple rejection microtasks / flush attempts must not double-fire.
  assertEquals(calls, 1);
});
