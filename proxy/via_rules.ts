import { byPattern } from "../pattern.ts";
import { forbidden } from "../response.ts";
import { subHeaders } from "./_substitute.ts";
import { methodApplies, roleApplies } from "./_match.ts";
import type { Auditor, Role, RouteRule } from "./types.ts";
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
  if (methodApplies(rule.method, req) && roleApplies(rule, roles)) {
    return await byPattern(rule.pattern ?? "*", handler(rule, roles, auditor))(
      req,
    );
  }
  return null;
}

const handler = (rule: RouteRule, roles: Role[], auditor?: Auditor) =>
async (
  incomingRequest: Request,
) => {
  if (rule.allow !== true) {
    if (auditor) {
      auditor({ kind: "denied", roles, rule, request: incomingRequest });
    }
    return forbidden();
  }

  const headers = subHeaders(
    rule.headers ?? {},
    new Headers(incomingRequest.headers),
  );

  const { url, method, body, signal } = incomingRequest;

  const outgoingRequest = new Request(url, {
    method,
    headers,
    body,
    signal,
  });

  const auditProps = auditor
    ? {
      roles,
      rule,
      request: outgoingRequest.clone(),
    }
    : undefined;

  if (auditor && auditProps) {
    auditor({ kind: "request", ...auditProps });
  }

  let response: Response;

  function aborted(this: AbortSignal) {
    if (auditor && auditProps) {
      auditor({ kind: "aborted", ...auditProps, reason: this.reason });
    }
  }

  try {
    outgoingRequest.signal.addEventListener("abort", aborted, { once: true });

    response = await fetch(outgoingRequest);
  } catch (error) {
    if (auditor && auditProps) {
      auditor({ kind: "error", ...auditProps, error });
    }
    throw error;
  }

  if (response.body) {
    // This is a bit of a hack, it allows the Request abort to be caught when it
    // happens rather than at the end of the Response stream.
    response = new Response(
      response.body.pipeThrough(new TransformStream()),
      response,
    );
  }

  if (auditor && auditProps) {
    auditor({ kind: "response", ...auditProps, response: response.clone() });
  }

  return response;
};
