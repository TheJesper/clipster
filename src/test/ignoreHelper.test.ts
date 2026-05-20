import fs from "fs";
import { filterIgnoredFiles } from "../ignoreHelper";

jest.mock("fs");

const mockFs = jest.mocked(fs);

describe("ignoreHelper – filterIgnoredFiles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no .gitignore, entries are plain files (not dirs)
    mockFs.existsSync.mockReturnValue(false);
    mockFs.statSync.mockReturnValue({
      isDirectory: () => false,
      isFile: () => true,
    } as unknown as fs.Stats);
  });

  it("passes all files when there are no ignore patterns", () => {
    const files = ["a.ts", "b.ts", "c.ts"];
    const result = filterIgnoredFiles("/workspace", files, "/workspace");
    expect(result).toEqual(files);
  });

  it("filters files matching additionalIgnores patterns", () => {
    const files = ["index.ts", "app.log", "debug.log"];
    const result = filterIgnoredFiles("/workspace", files, "/workspace", [
      "*.log",
    ]);
    expect(result).toEqual(["index.ts"]);
  });

  it("reads and applies .gitignore patterns", () => {
    mockFs.existsSync.mockReturnValue(true);
    (mockFs.readFileSync as jest.Mock).mockReturnValue("dist\n*.log\n");
    const files = ["src", "dist", "app.log", "index.ts"];
    mockFs.statSync.mockImplementation(((p: fs.PathLike) => ({
      isDirectory: () => String(p).endsWith("dist"),
      isFile: () => !String(p).endsWith("dist"),
    })) as unknown as typeof fs.statSync);

    const result = filterIgnoredFiles("/workspace", files, "/workspace");
    expect(result).not.toContain("app.log");
    expect(result).toContain("src");
    expect(result).toContain("index.ts");
  });

  it("returns empty array when files argument is not an array", () => {
    const result = filterIgnoredFiles(
      "/dir",
      null as unknown as string[],
      "/workspace"
    );
    expect(result).toEqual([]);
  });

  it("returns empty array when dir is invalid", () => {
    const result = filterIgnoredFiles(
      null as unknown as string,
      ["file.ts"],
      "/workspace"
    );
    expect(result).toEqual([]);
  });

  it("handles .gitignore read failure gracefully", () => {
    mockFs.existsSync.mockReturnValue(true);
    (mockFs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("Permission denied");
    });
    const files = ["file.ts"];
    const result = filterIgnoredFiles("/workspace", files, "/workspace");
    expect(result).toEqual(files);
  });

  it("falls back to dir as root when workspaceRoot is empty string", () => {
    const files = ["file.ts"];
    const result = filterIgnoredFiles("/workspace", files, "");
    expect(result).toEqual(files);
  });

  it("filters directories correctly when entry is a directory", () => {
    // node_modules/ pattern should match directories named node_modules
    mockFs.statSync.mockImplementation(((p: fs.PathLike) => ({
      isDirectory: () => String(p).endsWith("node_modules"),
      isFile: () => !String(p).endsWith("node_modules"),
    })) as unknown as typeof fs.statSync);

    const files = ["node_modules", "src", "index.ts"];
    const result = filterIgnoredFiles("/workspace", files, "/workspace", [
      "node_modules/",
    ]);
    expect(result).not.toContain("node_modules");
    expect(result).toContain("src");
    expect(result).toContain("index.ts");
  });

  it("skips non-string entries silently", () => {
    const files = ["file.ts", null as unknown as string, "other.ts"];
    const result = filterIgnoredFiles("/workspace", files, "/workspace");
    expect(result).toEqual(["file.ts", "other.ts"]);
  });

  // ─── additionalIgnores with various glob patterns ──────────────────────────

  it("filters files matching complex glob patterns in additionalIgnores", () => {
    const files = ["app.ts", "app.spec.ts", "utils.test.ts", "index.ts"];
    const result = filterIgnoredFiles("/workspace", files, "/workspace", [
      "*.spec.ts",
      "*.test.ts",
    ]);
    expect(result).toEqual(["app.ts", "index.ts"]);
  });

  it("filters with wildcard directory patterns", () => {
    mockFs.statSync.mockImplementation(((p: fs.PathLike) => ({
      isDirectory: () => String(p).endsWith("build"),
      isFile: () => !String(p).endsWith("build"),
    })) as unknown as typeof fs.statSync);

    const files = ["src", "build", "index.ts"];
    const result = filterIgnoredFiles("/workspace", files, "/workspace", [
      "build/",
    ]);
    expect(result).not.toContain("build");
    expect(result).toContain("src");
    expect(result).toContain("index.ts");
  });

  it("handles additionalIgnores as empty array (no filtering)", () => {
    const files = ["a.ts", "b.js"];
    const result = filterIgnoredFiles("/workspace", files, "/workspace", []);
    expect(result).toEqual(["a.ts", "b.js"]);
  });

  // ─── .gitignore with negation patterns ──────────────────────────────────────

  it("applies .gitignore negation pattern (!) to un-ignore a file", () => {
    mockFs.existsSync.mockReturnValue(true);
    (mockFs.readFileSync as jest.Mock).mockReturnValue("*.log\n!important.log\n");
    const files = ["app.log", "important.log", "debug.log", "index.ts"];
    const result = filterIgnoredFiles("/workspace", files, "/workspace");
    expect(result).toContain("important.log");
    expect(result).toContain("index.ts");
    expect(result).not.toContain("app.log");
    expect(result).not.toContain("debug.log");
  });

  // ─── .gitignore with comments ───────────────────────────────────────────────

  it("ignores comment lines in .gitignore", () => {
    mockFs.existsSync.mockReturnValue(true);
    (mockFs.readFileSync as jest.Mock).mockReturnValue(
      "# This is a comment\n*.log\n# Another comment\n",
    );
    const files = ["app.log", "index.ts"];
    const result = filterIgnoredFiles("/workspace", files, "/workspace");
    expect(result).not.toContain("app.log");
    expect(result).toContain("index.ts");
  });

  // ─── Nested directory filtering ──────────────────────────────────────────────

  it("filters files in a subdirectory relative to workspace root", () => {
    mockFs.existsSync.mockReturnValue(true);
    (mockFs.readFileSync as jest.Mock).mockReturnValue("dist\n");
    mockFs.statSync.mockImplementation(((p: fs.PathLike) => ({
      isDirectory: () => String(p).endsWith("dist"),
      isFile: () => !String(p).endsWith("dist"),
    })) as unknown as typeof fs.statSync);

    // Scanning a subdirectory, but .gitignore is at workspace root
    const files = ["helper.ts", "dist"];
    const result = filterIgnoredFiles(
      "/workspace/src",
      files,
      "/workspace",
    );
    // "dist" in src/ should be ignored because the pattern matches the directory name
    expect(result).not.toContain("dist");
    expect(result).toContain("helper.ts");
  });

  // ─── Edge: empty .gitignore ──────────────────────────────────────────────────

  it("handles empty .gitignore file gracefully", () => {
    mockFs.existsSync.mockReturnValue(true);
    (mockFs.readFileSync as jest.Mock).mockReturnValue("");
    const files = ["a.ts", "b.ts"];
    const result = filterIgnoredFiles("/workspace", files, "/workspace");
    expect(result).toEqual(["a.ts", "b.ts"]);
  });

  // ─── Edge: .gitignore with only whitespace ──────────────────────────────────

  it("handles .gitignore with only whitespace lines", () => {
    mockFs.existsSync.mockReturnValue(true);
    (mockFs.readFileSync as jest.Mock).mockReturnValue("  \n\n  \n");
    const files = ["a.ts", "b.ts"];
    const result = filterIgnoredFiles("/workspace", files, "/workspace");
    expect(result).toEqual(["a.ts", "b.ts"]);
  });

  // ─── Edge: multiple additionalIgnores with overlapping patterns ─────────────

  it("handles overlapping additionalIgnores patterns without duplicating filtering", () => {
    const files = ["debug.log", "error.log", "app.ts"];
    const result = filterIgnoredFiles("/workspace", files, "/workspace", [
      "*.log",
      "debug.*",
    ]);
    expect(result).toEqual(["app.ts"]);
  });
});
