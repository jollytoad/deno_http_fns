// Experimental SSE helper

export interface ServerSentEvent {
  comment?: string;
  event?: string;
  data?: string;
  id?: string;
  retry?: number;
}

/**
 * Format a server sent event message
 */
export function serverSentEvent(event?: ServerSentEvent | string) {
  const lines: string[] = [];

  function addField(name: string, value?: string | number) {
    if (typeof value === "string" || typeof value === "number") {
      lines.push(`${name}: ${value}`);
    }
  }
  function addMultiLineField(name: string, content?: string) {
    if (typeof content === "string") {
      content.split(/\r?\n/).forEach((line) => addField(name, line));
    }
  }

  if (typeof event === "string") {
    addMultiLineField("data", event);
  } else if (event && typeof event === "object") {
    addMultiLineField("", event.comment);
    addField("event", event.event);
    addMultiLineField("data", event.data);
    addField("id", event.id);
    addField("retry", event.retry);
  }

  if (lines.length === 0) {
    // Emit an empty comment if no data is given to keep the connection alive
    lines.push(":");
  }

  lines.push("");

  return lines.join("\n");
}
