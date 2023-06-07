import { byPattern } from "../pattern.ts";
import { forbidden } from "../response.ts";
import { subHeaders } from "./_substitute.ts";
import { intersect } from "https://deno.land/std@0.189.0/collections/intersect.ts";
import type { Auditor, Method, Role, RouteRule } from "./types.ts";
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
  req: Request,
) => {
  if (rule.allow !== true) {
    auditor?.({ kind: "denied", roles, rule, request: req });
    return forbidden();
  }

  const headers = subHeaders(rule.headers ?? {}, new Headers(req.headers));

  const { url, method, body } = req;

  const outgoingRequest = new Request(url, {
    method,
    headers,
    body,
  });

  auditor?.({
    kind: "request",
    roles,
    rule,
    request: outgoingRequest,
  });

  let response: Response;

  try {
    response = await fetch(outgoingRequest);
  } catch (error) {
    auditor?.({
      kind: "error",
      roles,
      rule,
      request: outgoingRequest,
      error,
    });
    throw error;
  }

  auditor?.({
    kind: "response",
    roles,
    rule,
    request: outgoingRequest,
    response: response,
  });

  return response;
};

function methodApplies(rule: RouteRule, req: Request) {
  const ruleMethods: (Method | "*")[] = Array.isArray(rule.method)
    ? rule.method
    : [rule.method ?? "*"];
  return ruleMethods.includes("*") ||
    ruleMethods.includes(req.method as Method);
}

function roleApplies(rule: RouteRule, roles: Role[]) {
  const ruleRoles = Array.isArray(rule.role) ? rule.role : [rule.role ?? "*"];
  return !!intersect(roles, ruleRoles).length;
}
