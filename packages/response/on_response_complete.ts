import { replaceBody } from "./replace_body.ts";

/**
 * Wrap a `Response` so that `onComplete` is invoked exactly once when its body
 * stream has been fully drained (success) or aborted (failure with reason).
 *
 * Uses a `TransformStream` pass-through to avoid the double-buffering that
 * `body.tee()` would incur. The `flush` callback on the TransformStream fires
 * when the source body ends normally; the `pipeTo` promise rejects on error
 * or cancellation, and that rejection is caught to call `onComplete` with
 * the reason.
 *
 * For a `Response` with no body (e.g. `new Response()`, `204 No Content`) the
 * callback is scheduled on the microtask queue, since the response is
 * considered complete as soon as the headers are sent.
 *
 * On the success path, `onComplete` is invoked with no arguments. On the
 * failure path (body error or cancellation), it is invoked with the reason
 * (whatever was passed to `body.cancel()` or the error that terminated the
 * stream).
 *
 * @param res the original Response whose body should be observed
 * @param onComplete invoked exactly once when the body is drained or aborted
 * @returns a new `Response` with the observed body
 *
 * @example
 * ```ts
 * let done = false;
 * const observed = onResponseComplete(new Response("hi"), () => {
 *   done = true;
 * });
 * await observed.text();
 * console.assert(done);
 * ```
 */
export function onResponseComplete(
  res: Response,
  onComplete: (reason?: unknown) => void,
): Response {
  if (!res.body) {
    queueMicrotask(() => onComplete());
    return res;
  }

  let settled = false;
  const settle = (reason?: unknown) => {
    if (settled) return;
    settled = true;
    onComplete(reason);
  };

  const passThrough = new TransformStream<Uint8Array, Uint8Array>({
    flush() {
      settle();
    },
  });

  res.body.pipeTo(passThrough.writable).catch(settle);

  return replaceBody(res, passThrough.readable);
}
