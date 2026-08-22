import { mkdir, readFile, readdir, rename, stat, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";

export interface Workspace {
  exists(relativePath: string): Promise<boolean>;
  readText(relativePath: string): Promise<string>;
  writeText(relativePath: string, content: string): Promise<void>;
  appendText(relativePath: string, content: string): Promise<void>;
  list(relativePath: string): Promise<string[]>;
  ensureDir(relativePath: string): Promise<void>;
}

function normalizeRelative(input: string): string {
  const normalized = path.posix.normalize(input.replaceAll("\\", "/"));
  if (normalized === ".." || normalized.startsWith("../") || path.posix.isAbsolute(normalized)) {
    throw new Error(`Workspace path escapes root: ${input}`);
  }
  return normalized === "." ? "" : normalized;
}

export class FileWorkspace implements Workspace {
  readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  private resolve(relativePath: string): string {
    const normalized = normalizeRelative(relativePath);
    const resolved = path.resolve(this.root, normalized);
    const relative = path.relative(this.root, resolved);
    if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Workspace path escapes root: ${relativePath}`);
    return resolved;
  }

  async exists(relativePath: string): Promise<boolean> {
    try {
      await stat(this.resolve(relativePath));
      return true;
    } catch {
      return false;
    }
  }

  async readText(relativePath: string): Promise<string> {
    return readFile(this.resolve(relativePath), "utf8");
  }

  async ensureDir(relativePath: string): Promise<void> {
    await mkdir(this.resolve(relativePath), { recursive: true });
  }

  async writeText(relativePath: string, content: string): Promise<void> {
    const destination = this.resolve(relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    const temporary = `${destination}.tmp-${process.pid}-${Date.now()}`;
    await writeFile(temporary, content, "utf8");
    await rename(temporary, destination);
  }

  async appendText(relativePath: string, content: string): Promise<void> {
    const destination = this.resolve(relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await appendFile(destination, content, "utf8");
  }

  async list(relativePath: string): Promise<string[]> {
    const target = this.resolve(relativePath);
    try {
      const entries = await readdir(target, { withFileTypes: true });
      return entries.map(entry => entry.name).sort();
    } catch {
      return [];
    }
  }
}

export class MemoryWorkspace implements Workspace {
  private readonly files = new Map<string, string>();
  private readonly directories = new Set<string>([""]);

  constructor(seed: Record<string, string> = {}) {
    for (const [filePath, content] of Object.entries(seed)) {
      const normalized = normalizeRelative(filePath);
      this.files.set(normalized, content);
      this.addParents(normalized);
    }
  }

  private addParents(relativePath: string): void {
    let directory = path.posix.dirname(relativePath);
    while (directory !== "." && directory !== "/") {
      this.directories.add(directory);
      directory = path.posix.dirname(directory);
    }
    this.directories.add("");
  }

  async exists(relativePath: string): Promise<boolean> {
    const normalized = normalizeRelative(relativePath);
    return this.files.has(normalized) || this.directories.has(normalized);
  }

  async readText(relativePath: string): Promise<string> {
    const normalized = normalizeRelative(relativePath);
    const value = this.files.get(normalized);
    if (value === undefined) throw new Error(`File not found: ${relativePath}`);
    return value;
  }

  async writeText(relativePath: string, content: string): Promise<void> {
    const normalized = normalizeRelative(relativePath);
    this.files.set(normalized, content);
    this.addParents(normalized);
  }

  async appendText(relativePath: string, content: string): Promise<void> {
    const normalized = normalizeRelative(relativePath);
    this.files.set(normalized, (this.files.get(normalized) ?? "") + content);
    this.addParents(normalized);
  }

  async list(relativePath: string): Promise<string[]> {
    const normalized = normalizeRelative(relativePath);
    const prefix = normalized.length === 0 ? "" : `${normalized}/`;
    const names = new Set<string>();
    for (const filePath of this.files.keys()) {
      if (!filePath.startsWith(prefix)) continue;
      const remainder = filePath.slice(prefix.length);
      const first = remainder.split("/")[0];
      if (first) names.add(first);
    }
    return [...names].sort();
  }

  async ensureDir(relativePath: string): Promise<void> {
    this.directories.add(normalizeRelative(relativePath));
  }

  snapshot(): Record<string, string> {
    return Object.fromEntries([...this.files.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }
}
