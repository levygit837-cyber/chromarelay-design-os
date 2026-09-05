import type { HookAPI } from "@oh-my-pi/pi-coding-agent/extensibility/hooks";

const PROTECTED = [".chromarelay/system", ".chromarelay/project"];
const MUTATING_SHELL = /(?:^|[;&|\s])(?:rm|mv|cp|install|tee|truncate)\b|(?:sed|perl)\s+[^\n]*(?:-i|-pi)\b|(?:^|[^<])>{1,2}(?!=)|writeFile|appendFile|rename\s*\(/i;

function referencesProtected(value: unknown): boolean {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  const normalized = text.replaceAll("\\", "/");
  return PROTECTED.some(segment => normalized.includes(segment));
}

export default function chromarelayGuard(pi: HookAPI): void {
  pi.on("tool_call", async event => {
    if (process.env.CHROMARELAY_UNSAFE_CANONICAL_WRITE === "1") return;
    if (event.toolName === "chromarelay_state") return;

    if ((event.toolName === "write" || event.toolName === "edit") && referencesProtected(event.input)) {
      return {
        block: true,
        reason: "ChromaRelay canonical state is protected. Write Run artifacts, then promote approved work with chromarelay_state. Set CHROMARELAY_UNSAFE_CANONICAL_WRITE=1 only for deliberate recovery."
      };
    }

    if (event.toolName === "bash") {
      const command = String(event.input.command ?? "");
      if (referencesProtected(command) && MUTATING_SHELL.test(command)) {
        return {
          block: true,
          reason: "Shell mutation of .chromarelay/system or .chromarelay/project is blocked. Use chromarelay_state Promotion or explicit recovery mode."
        };
      }
    }
  });
}
