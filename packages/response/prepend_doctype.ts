const DOCTYPE = "<!DOCTYPE html>\n";
const ENCODED_DOCTYPE = new TextEncoder().encode(DOCTYPE);

/**
 * Prepend `<!DOCTYPE html>` to the given response body, retaining the
 * original streaming capability of the body.
 *
 * A body of FormData or URLSearchParams is passed through unchanged.
 *
 * @param bodyInit A body of HTML content (without a doctype)
 * @returns A similar body with the standard HTML doctype prepended
 */
export function prependDocType(bodyInit: BodyInit): BodyInit {
  if (isData(bodyInit)) {
    return bodyInit;
  } else if (isStream(bodyInit)) {
    return stream(bodyInit.values());
  } else if (isAsyncIterable(bodyInit)) {
    return stream(bodyInit[Symbol.asyncIterator]());
  } else if (isIterable(bodyInit)) {
    return stream(bodyInit[Symbol.iterator]());
  } else {
    return new Blob([
      DOCTYPE,
      bodyInit,
    ]);
  }
}

function isStream(bodyInit: BodyInit): bodyInit is ReadableStream<Uint8Array> {
  return !!bodyInit && typeof bodyInit === "object" &&
    "getReader" in bodyInit && typeof bodyInit.getReader === "function";
}

function isAsyncIterable(
  bodyInit: BodyInit | AsyncIterable<Uint8Array>,
): bodyInit is AsyncIterable<Uint8Array> {
  return !!bodyInit && typeof bodyInit === "object" &&
    Symbol.asyncIterator in bodyInit &&
    typeof bodyInit[Symbol.asyncIterator] === "function";
}

function isIterable(
  bodyInit: BodyInit | Iterable<Uint8Array>,
): bodyInit is Iterable<Uint8Array> {
  return !!bodyInit && typeof bodyInit === "object" &&
    !(bodyInit instanceof String) &&
    Symbol.iterator in bodyInit &&
    typeof bodyInit[Symbol.iterator] === "function";
}

function isData(bodyInit: BodyInit): bodyInit is FormData | URLSearchParams {
  return bodyInit instanceof FormData || bodyInit instanceof URLSearchParams;
}

function stream(iterator: AsyncIterator<Uint8Array> | Iterator<Uint8Array>) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(ENCODED_DOCTYPE);
    },
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}
