import { methodApplies, patternApplies } from "./_match.ts";
import { subRef } from "./_substitute.ts";
import type {
  AuditKind,
  Auditor,
  AuditorFnSpec,
  AuditorSpec,
  AuditProps,
  Manifest,
} from "./types.ts";

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
      fn = await aggregatedAuditor(kind, manifest.auditors);
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
  return async (props) => {
    await Promise.all(fns.map((fn) => fn(props)));
  };
}

async function resolveAuditor(
  kind: AuditKind,
  auditorSpec?: AuditorSpec,
): Promise<Auditor> {
  let fn: Auditor | undefined;

  if (auditorSpec && (!auditorSpec.kind || auditorSpec.kind.includes(kind))) {
    fn = await resolveAuditorChain(auditorSpec);

    if (fn && auditorSpec?.method) {
      return (params) =>
        methodApplies(auditorSpec.method, params.request) ? fn?.(params) : null;
    }

    if (fn && auditorSpec?.pattern) {
      return (params) =>
        patternApplies(auditorSpec.pattern, params.request)
          ? fn?.(params)
          : null;
    }

    if (fn) {
      return async (params) => {
        try {
          return await fn?.(params);
        } catch (e) {
          console.error(
            `%cAuditor failed: ${JSON.stringify(auditorSpec, auditReplacer)}\n`,
            "color: red;",
            e,
          );
        }
      };
    }
  }

  return fn ?? noOp;
}

async function resolveAuditorChain(
  auditorSpec: AuditorSpec,
): Promise<Auditor | undefined> {
  const chain: (AuditorFnSpec | Auditor)[] = [
    ...auditorSpec.chain ?? [],
    auditorSpec,
  ];

  const fns = (await Promise.all(chain.map(resolveAuditorFn))).filter((
    fn,
  ): fn is Auditor => !!fn);

  if (fns.length) {
    return async (props: AuditProps) => {
      for (const fn of fns) {
        const result = await fn(props);
        if (result === null) {
          return null;
        }
        if (result) {
          props = result;
        }
      }
      return props;
    };
  }
}

async function resolveAuditorFn(
  fnSpec: AuditorFnSpec | Auditor,
): Promise<Auditor | undefined> {
  let fn: Auditor | undefined;

  if (typeof fnSpec === "function") {
    return fnSpec;
  } else if (typeof fnSpec.fn === "function") {
    fn = fnSpec.fn;
  } else {
    const moduleRef = subRef(fnSpec?.module);
    const serviceRef = subRef(fnSpec?.service);

    if (moduleRef) {
      const module = await import(`${moduleRef}`);
      if (typeof module.default === "function") {
        fn = module.default;
      }
    } else if (serviceRef) {
      fn = fetchAuditor(serviceRef, fnSpec);
    }
  }

  if (fn && fnSpec?.params) {
    return (rec) => fn?.({ ...rec, params: fnSpec.params });
  }

  return fn;
}

function noOp(props: AuditProps) {
  return props;
}

function fetchAuditor(
  url: string | URL,
  auditorSpec?: AuditorSpec,
): Auditor {
  return async (props) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(props, auditReplacer),
    });
    if (response.ok) {
      return {
        ...props,
        response,
      };
    } else {
      console.error(
        `%cAuditor failed: ${JSON.stringify(auditorSpec, auditReplacer)}\n`,
        "color: red;",
        `POST ${url} -> ${response.status} ${response.statusText}`,
      );
      return null;
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
  if (typeof value === "function") {
    return value.name + "()";
  }
  return value;
}
