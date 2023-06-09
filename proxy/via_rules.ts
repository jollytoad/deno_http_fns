import { byPattern } from "../pattern.ts";
import { forbidden } from "../response.ts";
import { subHeaders } from "./_substitute.ts";
import { intersect } from "https://deno.land/std@0.189.0/collections/intersect.ts";
import type { Auditor, HttpMethod, Role, RouteRule } from "./types.ts";
import type { Skip } from "../types.ts";

/**
 * Proxy the mapped request according to the rules of the manifest.
 */
export async function proxyViaRules(
  req: Request,
  rules: RouteRule[],
  roles: Role[],
  auditor?: Auditor,
): Promise<Response | Skip> {
  for (const rule of rules) {
    const res = await proxyViaRule(req, rule, roles, auditor);
    if (res) {
      return res;
    }
  }

  return null;
}

async function proxyViaRule(
  req: Request,
  rule: RouteRule,
  roles: Role[],
  auditor?: Auditor,
): Promise<Response | Skip> {
  if (methodApplies(rule, req) && roleApplies(rule, roles)) {
    return await byPattern(rule.pattern ?? "*", handler(rule, roles, auditor))(
      req,
    );
  }
  return null;
}

const handler = (rule: RouteRule, roles: Role[], auditor?: Auditor) =>
async (
  originalRequest: Request,
) => {
  if (rule.allow !== true) {
    await auditor?.({ kind: "denied", roles, rule, request: originalRequest });
    return forbidden();
  }

  const headers = subHeaders(
    rule.headers ?? {},
    new Headers(originalRequest.headers),
  );

  const { url, method, body, signal } = originalRequest;

  const request = new Request(url, {
    method,
    headers,
    body,
    signal,
  });

  await auditor?.({ kind: "request", roles, rule, request });

  let response: Response;

  function aborted(this: AbortSignal) {
    auditor?.({ kind: "aborted", roles, rule, request, reason: this.reason });
  }

  try {
    request.signal.addEventListener("abort", aborted, { once: true });

    response = await fetch(request);
  } catch (error) {
    auditor?.({ kind: "error", roles, rule, request, error });
    throw error;
  }

  await auditor?.({ kind: "response", roles, rule, request, response });

  if (response.body) {
    // This is a bit of a hack, it allows the Request abort to be caught when it
    // happens rather than at the end of the Response stream.
    response = new Response(
      response.body.pipeThrough(new TransformStream()),
      response,
    );
  }

  return response;
};

function methodApplies(rule: RouteRule, req: Request) {
  const ruleMethods: (HttpMethod | "*")[] = Array.isArray(rule.method)
    ? rule.method
    : [rule.method ?? "*"];
  return ruleMethods.includes("*") ||
    ruleMethods.includes(req.method as HttpMethod);
}

function roleApplies(rule: RouteRule, roles: Role[]) {
  const ruleRoles = Array.isArray(rule.role) ? rule.role : [rule.role ?? "*"];
  return !!intersect(roles, ruleRoles).length;
}
