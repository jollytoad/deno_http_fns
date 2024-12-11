import { badRequest } from "@http/response/bad-request";

/**
 * Get the body of a Request as a plain old javascript object.
 *
 * The body will be processed according to its media type:
 *
 * - `application/json` - will be parsed a JSON object, the value must be an object otherwise an error is thrown
 * - `application/x-www-form-urlencoded` or `multipart/form-data` - the form entries are deserialized into a plain object, duplicate properties will override
 *   according to the behaviour of `Object.fromEntries`.
 * - any other type will throw an error
 *
 * @param req the Request to process
 * @param processForm an optional function that is called when processing form data, this can be used to convert form values or deal with duplicate form values
 * @returns a plain object
 */
export async function getBodyAsObject<T>(
  req: Request,
  processForm?: (data: Record<string, FormDataEntryValue>, form: FormData) => T,
): Promise<T> | never {
  const contentType = req.headers.get("content-type");

  let body;

  switch (contentType) {
    case "application/json":
      try {
        body = await req.json();
      } catch (error: unknown) {
        throw badRequest(`Invalid request body: ${(error as Error)?.message}`);
      }
      if (!body || typeof body !== "object") {
        throw badRequest(
          `Invalid request body: JSON object or array expected`,
        );
      }
      break;

    case "application/x-www-form-urlencoded":
    case "multipart/form-data":
      try {
        const form = await req.formData();
        body = Object.fromEntries(form.entries());
        if (processForm) {
          body = processForm(body, form);
        }
      } catch (error: unknown) {
        throw badRequest(`Invalid request body: ${(error as Error)?.message}`);
      }
      break;

    default:
      throw badRequest(`Unexpected request content-type: ${contentType}`);
  }

  return body;
}
