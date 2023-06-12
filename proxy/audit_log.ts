import { AuditProps } from "./types.ts";

export default (props: AuditProps) => {
  console.debug(
    `%c${props.kind} rule: "${
      props.rule.method || "*"
    } ${props.rule.pattern}", url: "${props.request.url}"`,
    `color: blue;`,
  );
  if (props.params?.log === "roles") {
    console.debug(
      `%c${" ".repeat(props.kind.length)} roles: ${props.roles}`,
      `color: blue;`,
    );
  }
};
