import { subRef } from "./_substitute.ts";
import type { AuditKind, Auditor, AuditorSpec, Manifest } from "./types.ts";

// deno-lint-ignore require-await
export async function getAuditor(
  _req: Request,
  manifest: Manifest,
): Promise<Auditor> {
  const fnCache = new Map<AuditKind, Auditor>();

  return async (params) => {
    const kind = params.kind;
    let fn = fnCache.get(kind);
    if (!fn) {
      fn = await aggregatedAuditor(kind, manifest.auditors),
        fnCache.set(kind, fn!);
    }
    return fn!(params);
  };
}

async function aggregatedAuditor(
  kind: AuditKind,
  auditorSpecs: AuditorSpec[] = [],
): Promise<Auditor> {
  const fns = await Promise.all(
    auditorSpecs.map((spec) => resolveAuditor(kind, spec)),
  );
  return async (params) => {
    await Promise.all(fns.map((fn) => fn(params)));
  };
}

async function resolveAuditor(
  kind: AuditKind,
  auditorSpec?: AuditorSpec,
): Promise<Auditor> {
  let fn: Auditor | undefined;

  if (!auditorSpec?.kind || auditorSpec.kind.includes(kind)) {
    if (typeof auditorSpec?.fn === "function") {
      fn = auditorSpec.fn;
    } else {
      const moduleRef = subRef(auditorSpec?.module);
      const serviceRef = subRef(auditorSpec?.service);

      if (moduleRef) {
        const module = await import(`${moduleRef}`);
        if (typeof module.default === "function") {
          fn = module.default;
        }
      } else if (serviceRef) {
        fn = fetchAuditor(serviceRef);
      }
    }

    if (fn && auditorSpec?.params) {
      return (params) => fn?.({ ...params, params: auditorSpec.params });
    }
  }

  return fn ?? noOp;
}

function noOp() {}

function fetchAuditor(
  url: string | URL,
): Auditor {
  return async (params): Promise<void> => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params, auditReplacer),
    });
    if (!response.ok) {
      console.warn(
        `%Auditor failed: POST ${url} -> ${response.status} ${response.statusText}`,
        "color: red;",
      );
    }
  };
}

function auditReplacer(_key: string, value: unknown) {
  if (value instanceof Request) {
    return {
      url: value.url,
      method: value.method,
      headers: [...value.headers.entries()],
    };
  }
  if (value instanceof Response) {
    return {
      status: value.status,
      statusText: value.statusText,
      headers: [...value.headers.entries()],
    };
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
    };
  }
  return value;
}
