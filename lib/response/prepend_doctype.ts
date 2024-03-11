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
    const reader = bodyInit.getReader();

    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(ENCODED_DOCTYPE);
      },
      async pull(controller) {
        const { value, done } = await reader.read();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      },
    });
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

function isData(bodyInit: BodyInit): bodyInit is FormData | URLSearchParams {
  return bodyInit instanceof FormData || bodyInit instanceof URLSearchParams;
}
