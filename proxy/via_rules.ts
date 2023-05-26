import { byPattern } from "../pattern.ts";
import { forbidden } from "../response.ts";
import { subHeaders } from "./_substitute.ts";
import { intersect } from "https://deno.land/std@0.189.0/collections/intersect.ts";
import type { Method, Role, RouteRule } from "./types.ts";
import type { Skip } from "../types.ts";

/**
 * Proxy the mapped request according to the rules of the manifest.
 */
export async function proxyViaRules(
  req: Request,
  rules: RouteRule[],
  roles: Role[],
): Promise<Response | Skip> {
  for (const rule of rules) {
    const res = await proxyViaRule(req, rule, roles);
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
): Promise<Response | Skip> {
  if (methodApplies(rule, req) && roleApplies(rule, roles)) {
    return await byPattern(rule.pattern ?? "*", handler(rule))(req);
  }
  return forbidden();
}

const handler = (rule: RouteRule) => (req: Request) => {
  if (rule.allow !== true) {
    return forbidden();
  }

  const headers = subHeaders(rule.headers ?? {}, new Headers(req.headers));

  const { url, method, body } = req;

  console.log(`> ${method} ${url}`, headers);

  return fetch(url, {
    method,
    headers,
    body,
  });
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
