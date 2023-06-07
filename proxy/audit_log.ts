import { AuditRecord } from "./types.ts";

export default (record: AuditRecord) => {
  console.debug(
    `%c${record.kind} rule: "${
      record.rule.method || "*"
    } ${record.rule.pattern}", url: "${record.request.url}"`,
    `color: blue;`,
  );
  if (record.params?.log === "roles") {
    console.debug(
      `%c${" ".repeat(record.kind.length)} roles: ${record.roles}`,
      `color: blue;`,
    );
  }
};
