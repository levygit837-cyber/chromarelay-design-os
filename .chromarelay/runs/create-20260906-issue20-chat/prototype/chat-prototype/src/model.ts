/** Stub domain model. All synthetic, deterministic, no network. */

export type ToolKind = 'Write' | 'Read' | 'Edit' | 'Bash' | 'WebSearch';
export type ToolStatus = 'queued' | 'running' | 'staged' | 'succeeded' | 'failed';
export type TurnStatus = 'ok' | 'running' | 'failed' | 'idle';

export interface DiffLine {
  kind: 'add' | 'del' | 'ctx';
  text: string;
}

export type WellVariant = 'diff' | 'cmdout' | 'excerpt' | 'errorbox' | 'staged' | 'queued-note';

export interface ToolDetail {
  variant: WellVariant;
  /** Unified diff lines (diff variant). */
  diff?: DiffLine[];
  /** Terminal output lines (cmdout variant). */
  cmdout?: string[];
  cmdoutExit?: number;
  /** Excerpt text + line range (excerpt variant). */
  excerpt?: string;
  excerptRange?: string;
  /** Error message + exit code (errorbox variant). */
  error?: string;
  exitCode?: number;
  /** Staged progress (staged variant). */
  step?: number;
  steps?: number;
}

export interface ToolCall {
  id: string;
  kind: ToolKind;
  target: string;
  status: ToolStatus;
  durationMs: number | null;
  detail: ToolDetail;
}

export interface Turn {
  no: number;
  title: string;
  subline: string;
  status: TurnStatus;
  prose: string;
  durationMs: number | null;
  tools: ToolCall[];
  attempt: number;
  dismissed?: { reason: string; note?: string } | null;
  userPrompt: string;
  followUps: string[] | null;
}

export interface BrowserEvidence {
  title: string;
  url: string;
  excerpt: string;
  excerptRange: string;
}

export interface FileNode {
  path: string;
  kind: 'file' | 'dir';
  change: 'added' | 'edited' | 'none';
  status: 'ok' | 'run' | 'bad';
  children?: FileNode[];
}

export interface GitHubEvidence {
  repo: string;
  ref: string;
  summary: string;
}

export type EvidenceSlot<T> = { state: 'populated'; data: T } | { state: 'empty' } | { state: 'error' };

export interface TurnEvidence {
  browser: EvidenceSlot<BrowserEvidence>;
  files: EvidenceSlot<FileNode[]>;
  github: EvidenceSlot<GitHubEvidence>;
}

export interface Session {
  id: string;
  projectId: string;
  title: string;
  updatedAt: string;
  turns: Turn[];
  evidence: Record<number, TurnEvidence>;
  suggestions: string[];
}

export interface Project {
  id: string;
  name: string;
  sessionIds: string[];
}

export type WingView = 'browser' | 'files' | 'github';
export type DemoStateId = 'default' | 'empty' | 'streaming' | 'failed' | 'long' | 'narrow';
export type ComposerMode = 'Plan' | 'Act';
