import { badRequest } from "@http/response/bad-request";

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
      } catch (e) {
        throw badRequest(`Invalid request body: ${e.message}`);
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
      } catch (e) {
        throw badRequest(`Invalid request body: ${e.message}`);
      }
      break;

    default:
      throw badRequest(`Unexpected request content-type: ${contentType}`);
  }

  return body;
}
