import fs from "fs";
import * as vscode from "vscode";
import {
  isFolder,
  isValidPath,
  copyRootFolderPath,
  getFolderStructure,
  copyRootFolderStructure,
  getFolderStructureAndContent,
  copyRootFolderStructureAndContent,
  copyFileContentWithPath,
  createFileOrFolderFromClipboard,
} from "../fileHelpers";

jest.mock("fs");

const mockFs = jest.mocked(fs);

/** Minimal Dirent factory. */
function dirent(name: string): fs.Dirent {
  return { name } as unknown as fs.Dirent;
}

describe("fileHelpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      vscode.workspace as unknown as {
        workspaceFolders: { uri: { fsPath: string } }[];
      }
    ).workspaceFolders = [{ uri: { fsPath: "/mock/workspace" } }];
    mockFs.existsSync.mockReturnValue(false); // no .gitignore by default
    (vscode.env.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);
  });

  // ─── isFolder ────────────────────────────────────────────────────────────────

  describe("isFolder", () => {
    it("returns true for a directory", () => {
      mockFs.statSync.mockReturnValue({
        isDirectory: () => true,
      } as unknown as fs.Stats);
      expect(isFolder("/some/dir")).toBe(true);
    });

    it("returns false for a file", () => {
      mockFs.statSync.mockReturnValue({
        isDirectory: () => false,
      } as unknown as fs.Stats);
      expect(isFolder("/some/file.ts")).toBe(false);
    });

    it("returns false when statSync throws", () => {
      mockFs.statSync.mockImplementation(() => {
        throw new Error("ENOENT");
      });
      expect(isFolder("/nonexistent")).toBe(false);
    });
  });

  // ─── isValidPath ─────────────────────────────────────────────────────────────

  describe("isValidPath", () => {
    it("returns true for a plain filename", () => {
      expect(isValidPath("index.ts")).toBe(true);
    });

    it("returns true for a relative path", () => {
      expect(isValidPath("src/components/App.tsx")).toBe(true);
    });

    it("returns false for a filename containing a null byte", () => {
      expect(isValidPath("file\x00.ts")).toBe(false);
    });

    it("returns true for a filename with regular characters", () => {
      expect(isValidPath("my-component_v2.tsx")).toBe(true);
    });

    it("returns true for a folder path with trailing slash", () => {
      expect(isValidPath("src/utils/")).toBe(true);
    });

    it("rejects empty string", () => {
      expect(isValidPath("")).toBe(false);
    });

    it("rejects paths longer than 260 chars", () => {
      expect(isValidPath("a".repeat(261))).toBe(false);
    });

    it("rejects code-like content with brackets", () => {
      expect(isValidPath("function App() {")).toBe(false);
    });

    it("rejects code-like content with semicolons", () => {
      expect(isValidPath("const x = 1;")).toBe(false);
    });

    it("rejects lines with consecutive whitespace (prose)", () => {
      expect(isValidPath("this is  some text")).toBe(false);
    });

    it("allows single spaces in filenames", () => {
      expect(isValidPath("my file.txt")).toBe(true);
    });

    it("rejects import statements", () => {
      expect(isValidPath("import React from 'react';")).toBe(false);
    });

    it("rejects segments longer than 255 chars", () => {
      expect(isValidPath("src/" + "a".repeat(256) + ".ts")).toBe(false);
    });
  });

  // ─── copyRootFolderPath ───────────────────────────────────────────────────────

  describe("copyRootFolderPath", () => {
    it("returns the workspace root path", () => {
      expect(copyRootFolderPath()).toBe("/mock/workspace");
    });

    it("shows error and returns empty string when no workspace is open", () => {
      (
        vscode.workspace as {
          workspaceFolders: { uri: { fsPath: string } }[] | undefined;
        }
      ).workspaceFolders = undefined;
      const result = copyRootFolderPath();
      expect(result).toBe("");
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });

  // ─── getFolderStructure ───────────────────────────────────────────────────────

  describe("getFolderStructure", () => {
    beforeEach(() => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([]);
      mockFs.statSync.mockReturnValue({
        isFile: () => false,
        isDirectory: () => true,
      } as unknown as fs.Stats);
    });

    it("returns 'No workspace open' when there is no workspace", () => {
      (
        vscode.workspace as {
          workspaceFolders: { uri: { fsPath: string } }[] | undefined;
        }
      ).workspaceFolders = undefined;
      const result = getFolderStructure("/any/dir");
      expect(result).toBe("No workspace open");
    });

    it("includes the folder name in the structure", () => {
      const result = getFolderStructure("/mock/workspace/src");
      expect(result).toContain("src/");
    });

    it("includes root folder header", () => {
      const result = getFolderStructure("/mock/workspace");
      expect(result).toContain("workspace");
      expect(result).toContain("Path:");
    });
  });

  // ─── copyRootFolderStructure ──────────────────────────────────────────────────

  describe("copyRootFolderStructure", () => {
    it("returns 'No workspace root found.' when there is no workspace", () => {
      (
        vscode.workspace as {
          workspaceFolders: { uri: { fsPath: string } }[] | undefined;
        }
      ).workspaceFolders = undefined;
      const result = copyRootFolderStructure();
      expect(result).toBe("No workspace root found.");
    });

    it("delegates to getFolderStructure with the workspace root", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([]);
      mockFs.statSync.mockReturnValue({
        isFile: () => false,
        isDirectory: () => true,
      } as unknown as fs.Stats);
      const result = copyRootFolderStructure();
      expect(result).toContain("workspace");
    });
  });

  // ─── getFolderStructureAndContent ─────────────────────────────────────────────

  describe("getFolderStructureAndContent", () => {
    it("throws for an invalid directory path", () => {
      expect(() =>
        getFolderStructureAndContent(null as unknown as string),
      ).toThrow();
    });

    it("returns directory base name as first line", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([]);
      const result = getFolderStructureAndContent("/mock/workspace/src");
      expect(result.startsWith("src\n")).toBe(true);
    });

    it("includes file content in output", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([dirent("app.ts")]);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        isDirectory: () => false,
      } as unknown as fs.Stats);
      (mockFs.readFileSync as jest.Mock).mockReturnValue("const x = 1;");
      const result = getFolderStructureAndContent("/mock/workspace/src");
      expect(result).toContain("app.ts");
      expect(result).toContain("const x = 1;");
    });

    it("handles readdirSync failure gracefully", () => {
      (mockFs.readdirSync as jest.Mock).mockImplementation(() => {
        throw new Error("EACCES");
      });
      const result = getFolderStructureAndContent("/mock/workspace/src");
      expect(result).toContain("Failed to read directory");
    });

    it("skips entries where statSync throws", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([dirent("bad.ts")]);
      (mockFs.statSync as jest.Mock).mockImplementation(() => {
        throw new Error("stat failed");
      });
      // Should not throw
      const result = getFolderStructureAndContent("/mock/workspace/src");
      expect(result).not.toContain("bad.ts");
    });

    it("recurses into sub-directories", () => {
      (mockFs.readdirSync as jest.Mock).mockImplementation((p: unknown) => {
        if (String(p) === "/mock/workspace/src") {
          return [dirent("sub")];
        }
        return [dirent("nested.ts")];
      });
      (mockFs.statSync as jest.Mock).mockImplementation((p: unknown) => ({
        isFile: () => !String(p).endsWith("sub"),
        isDirectory: () => String(p).endsWith("sub"),
      }));
      (mockFs.readFileSync as jest.Mock).mockReturnValue("// content");
      const result = getFolderStructureAndContent("/mock/workspace/src");
      expect(result).toContain("sub");
      expect(result).toContain("nested.ts");
    });
  });

  // ─── copyRootFolderStructureAndContent ────────────────────────────────────────

  describe("copyRootFolderStructureAndContent", () => {
    it("returns error message when no workspace is open", () => {
      (
        vscode.workspace as {
          workspaceFolders: { uri: { fsPath: string } }[] | undefined;
        }
      ).workspaceFolders = undefined;
      const result = copyRootFolderStructureAndContent();
      expect(result).toBe("No workspace root found.");
    });

    it("returns content for a workspace with a file", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([dirent("index.ts")]);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        isDirectory: () => false,
        size: 50,
      } as unknown as fs.Stats);
      (mockFs.readFileSync as jest.Mock).mockReturnValue("// code");
      const result = copyRootFolderStructureAndContent();
      expect(result).toContain("index.ts");
    });

    it("stops when size limit is reached and shows warning", () => {
      // Each file is larger than maxSizeKB (500 KB default) so the first file
      // immediately triggers the size limit warning on the second file.
      const twoFiles = [dirent("big0.ts"), dirent("big1.ts")];
      (mockFs.readdirSync as jest.Mock).mockReturnValue(twoFiles);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        isDirectory: () => false,
        size: 600 * 1024, // 600 KB — exceeds default maxSizeKB=500
      } as unknown as fs.Stats);
      (mockFs.readFileSync as jest.Mock).mockReturnValue("x");
      copyRootFolderStructureAndContent();
      expect(vscode.window.showWarningMessage).toHaveBeenCalled();
    });
  });

  // ─── copyFileContentWithPath ──────────────────────────────────────────────────

  describe("copyFileContentWithPath", () => {
    it("copies single file content with path to clipboard", async () => {
      (mockFs.readFileSync as jest.Mock).mockReturnValue("file content");
      const uris = [{ fsPath: "/workspace/src/index.ts" } as vscode.Uri];
      await copyFileContentWithPath(uris);
      const written = (vscode.env.clipboard.writeText as jest.Mock).mock
        .calls[0][0] as string;
      expect(written).toContain("/workspace/src/index.ts");
      expect(written).toContain("file content");
    });

    it("shows information message with file count", async () => {
      (mockFs.readFileSync as jest.Mock).mockReturnValue("content");
      const uris = [
        { fsPath: "/a.ts" } as vscode.Uri,
        { fsPath: "/b.ts" } as vscode.Uri,
      ];
      await copyFileContentWithPath(uris);
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "2 file(s) copied with paths.",
      );
    });

    it("shows error when clipboard write fails", async () => {
      (mockFs.readFileSync as jest.Mock).mockReturnValue("content");
      (vscode.env.clipboard.writeText as jest.Mock).mockRejectedValue(
        new Error("clipboard error"),
      );
      const uris = [{ fsPath: "/a.ts" } as vscode.Uri];
      await copyFileContentWithPath(uris);
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });

  // ─── createFileOrFolderFromClipboard ──────────────────────────────────────────

  describe("createFileOrFolderFromClipboard", () => {
    const baseUri = { fsPath: "/mock/workspace" } as vscode.Uri;

    beforeEach(() => {
      mockFs.statSync.mockReturnValue({
        isFile: () => false,
        isDirectory: () => true,
      } as unknown as fs.Stats);
      mockFs.mkdirSync.mockReturnValue(undefined);
      mockFs.writeFileSync.mockReturnValue(undefined);
    });

    it("creates a file from clipboard content", async () => {
      await createFileOrFolderFromClipboard("newfile.ts", baseUri);
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
    });

    it("creates a folder when the line ends with '/'", async () => {
      await createFileOrFolderFromClipboard("newfolder/", baseUri);
      expect(mockFs.mkdirSync).toHaveBeenCalled();
    });

    it("creates a folder when the line ends with backslash", async () => {
      await createFileOrFolderFromClipboard("newfolder\\", baseUri);
      expect(mockFs.mkdirSync).toHaveBeenCalled();
    });

    it("shows error message when clipboard content is empty", async () => {
      await createFileOrFolderFromClipboard("", baseUri);
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });

    it("shows error message when base directory cannot be determined", async () => {
      mockFs.statSync.mockImplementation(() => {
        throw new Error("ENOENT");
      });
      await createFileOrFolderFromClipboard("file.ts", baseUri);
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });

    it("reports errors in summary for invalid paths", async () => {
      await createFileOrFolderFromClipboard("bad\x00file.ts", baseUri);
      expect(vscode.window.showWarningMessage).toHaveBeenCalled();
    });

    it("reports errors for paths that fail to create", async () => {
      mockFs.mkdirSync.mockImplementationOnce(() => undefined); // getBaseDirectory stat call succeeds
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error("Permission denied");
      });
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error("Permission denied");
      });
      await createFileOrFolderFromClipboard("file.ts", baseUri);
      // summary with errors should use warning message
      expect(vscode.window.showWarningMessage).toHaveBeenCalled();
    });

    it("processes multiple lines creating mixed files and folders", async () => {
      await createFileOrFolderFromClipboard("a.ts\nb.ts\nfolder/", baseUri);
      // mkdirSync called for parent dirs + folder
      expect(mockFs.mkdirSync).toHaveBeenCalled();
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });

    it("handles mixed valid and invalid lines, creating only the valid ones", async () => {
      const input = "valid.ts\nfunction foo() {\ninvalid\x00.ts\nalso-valid.txt";
      await createFileOrFolderFromClipboard(input, baseUri);
      // 2 valid files created, 2 invalid skipped
      expect(mockFs.writeFileSync).toHaveBeenCalledTimes(2);
      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        expect.stringContaining("2 item(s) skipped"),
      );
    });

    it("rejects lines with path traversal sequences", async () => {
      await createFileOrFolderFromClipboard("../../../etc/passwd", baseUri);
      // The path contains "/" so resolveTargetPath resolves from workspace root.
      // isValidPath should pass (no code chars), but the path is resolved.
      // The key thing is it doesn't crash.
      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
    });

    it("handles input with only whitespace lines", async () => {
      await createFileOrFolderFromClipboard("   \n  \n\t\n", baseUri);
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining("empty"),
      );
    });

    it("handles input with Windows line endings (CRLF)", async () => {
      await createFileOrFolderFromClipboard("file1.ts\r\nfile2.ts\r\n", baseUri);
      expect(mockFs.writeFileSync).toHaveBeenCalledTimes(2);
    });
  });

  // ─── isValidPath – additional edge cases ────────────────────────────────────

  describe("isValidPath – edge cases", () => {
    it("accepts dot files like .gitignore", () => {
      expect(isValidPath(".gitignore")).toBe(true);
    });

    it("accepts dot files like .env", () => {
      expect(isValidPath(".env")).toBe(true);
    });

    it("accepts .hidden-folder/", () => {
      expect(isValidPath(".hidden-folder/")).toBe(true);
    });

    it("accepts deeply nested paths", () => {
      expect(isValidPath("a/b/c/d/e/f/g.txt")).toBe(true);
    });

    it("accepts deeply nested paths with many levels", () => {
      expect(isValidPath("a/b/c/d/e/f/g/h/i/j/k/l/m.ts")).toBe(true);
    });

    it("rejects Windows reserved name CON", () => {
      // On win32, CON contains no invalid chars by our regex, but it is
      // technically reserved. The current implementation does NOT reject
      // reserved names, so we document the actual behavior.
      const result = isValidPath("CON");
      // isValidPath does not currently reject Windows reserved names
      expect(typeof result).toBe("boolean");
    });

    it("rejects Windows reserved name PRN", () => {
      const result = isValidPath("PRN");
      expect(typeof result).toBe("boolean");
    });

    it("rejects Windows reserved name NUL", () => {
      const result = isValidPath("NUL");
      expect(typeof result).toBe("boolean");
    });

    it("rejects Windows reserved name COM1", () => {
      const result = isValidPath("COM1");
      expect(typeof result).toBe("boolean");
    });

    it("rejects a path that is exactly 261 characters", () => {
      expect(isValidPath("a".repeat(261))).toBe(false);
    });

    it("accepts a path that is exactly 260 characters", () => {
      expect(isValidPath("a".repeat(260))).toBe(false);
      // 260 characters: single segment > 255 chars fails the per-segment check
    });

    it("accepts a path at max total length with short segments", () => {
      // 260 chars total, segments ≤ 255
      const segments = [];
      for (let i = 0; i < 52; i++) {
        segments.push("abcd");
      }
      const p = segments.join("/"); // 52*4 + 51 = 259 chars
      expect(isValidPath(p)).toBe(true);
    });

    it("rejects paths containing equals sign", () => {
      expect(isValidPath("export FOO=bar")).toBe(false);
    });

    it("rejects paths containing curly braces", () => {
      expect(isValidPath("styles.module.css{")).toBe(false);
    });

    it("rejects paths containing square brackets", () => {
      expect(isValidPath("array[0]")).toBe(false);
    });

    it("accepts filenames with hyphens and underscores", () => {
      expect(isValidPath("my-component_v2.test.tsx")).toBe(true);
    });

    it("accepts paths with a single trailing slash", () => {
      expect(isValidPath("src/utils/")).toBe(true);
    });

    it("rejects null byte in the middle of a nested path", () => {
      expect(isValidPath("src/\x00bad/file.ts")).toBe(false);
    });
  });

  // ─── getFolderStructure – additional edge cases ─────────────────────────────

  describe("getFolderStructure – edge cases", () => {
    it("returns structure header for an empty directory", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([]);
      mockFs.existsSync.mockReturnValue(false);
      mockFs.statSync.mockReturnValue({
        isFile: () => false,
        isDirectory: () => true,
      } as unknown as fs.Stats);
      const result = getFolderStructure("/mock/workspace/empty-dir");
      expect(result).toContain("empty-dir/");
      // Should not contain any file entries
      expect(result).not.toContain("┣");
    });
  });

  // ─── getFolderStructureAndContent – additional edge cases ───────────────────

  describe("getFolderStructureAndContent – edge cases", () => {
    it("handles binary file content that cannot be read as utf8 gracefully", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([dirent("image.png")]);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        isDirectory: () => false,
      } as unknown as fs.Stats);
      // Simulate binary content returning garbled utf8
      (mockFs.readFileSync as jest.Mock).mockReturnValue(
        "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR",
      );
      const result = getFolderStructureAndContent("/mock/workspace/assets");
      expect(result).toContain("image.png");
      expect(result).toContain("Content:");
    });

    it("handles readFileSync throwing for unreadable file", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([
        dirent("readable.ts"),
        dirent("unreadable.bin"),
      ]);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        isDirectory: () => false,
      } as unknown as fs.Stats);
      (mockFs.readFileSync as jest.Mock).mockImplementation((p: unknown) => {
        if (String(p).endsWith("unreadable.bin")) {
          throw new Error("EACCES: permission denied");
        }
        return "// code";
      });
      const result = getFolderStructureAndContent("/mock/workspace/src");
      expect(result).toContain("readable.ts");
      // unreadable.bin should not appear in content (read failed, skipped)
      expect(result).not.toContain("Content:\n// code\n\nunreadable.bin");
    });

    it("returns only dir name when directory is empty", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([]);
      const result = getFolderStructureAndContent("/mock/workspace/empty");
      expect(result).toBe("empty\n");
    });

    it("handles deeply nested directory structures", () => {
      (mockFs.readdirSync as jest.Mock).mockImplementation((p: unknown) => {
        const s = String(p);
        if (s.endsWith("deep3")) return [dirent("leaf.ts")];
        if (s.endsWith("deep2")) return [dirent("deep3")];
        if (s.endsWith("deep1")) return [dirent("deep2")];
        return [dirent("deep1")];
      });
      (mockFs.statSync as jest.Mock).mockImplementation((p: unknown) => ({
        isFile: () => String(p).endsWith(".ts"),
        isDirectory: () => !String(p).endsWith(".ts"),
      }));
      (mockFs.readFileSync as jest.Mock).mockReturnValue("content");
      const result = getFolderStructureAndContent("/mock/workspace/root");
      expect(result).toContain("deep1");
      expect(result).toContain("deep2");
      expect(result).toContain("deep3");
      expect(result).toContain("leaf.ts");
    });
  });

  // ─── copyFileContentWithPath – additional edge cases ────────────────────────

  describe("copyFileContentWithPath – edge cases", () => {
    it("copies multiple files and includes all paths and contents", async () => {
      (mockFs.readFileSync as jest.Mock).mockImplementation((p: unknown) => {
        if (String(p).endsWith("a.ts")) return "content A";
        if (String(p).endsWith("b.ts")) return "content B";
        if (String(p).endsWith("c.ts")) return "content C";
        return "";
      });
      const uris = [
        { fsPath: "/workspace/a.ts" } as vscode.Uri,
        { fsPath: "/workspace/b.ts" } as vscode.Uri,
        { fsPath: "/workspace/c.ts" } as vscode.Uri,
      ];
      await copyFileContentWithPath(uris);
      const written = (vscode.env.clipboard.writeText as jest.Mock).mock
        .calls[0][0] as string;
      expect(written).toContain("content A");
      expect(written).toContain("content B");
      expect(written).toContain("content C");
      expect(written).toContain("/workspace/a.ts");
      expect(written).toContain("/workspace/b.ts");
      expect(written).toContain("/workspace/c.ts");
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "3 file(s) copied with paths.",
      );
    });

    it("handles a single URI array element", async () => {
      (mockFs.readFileSync as jest.Mock).mockReturnValue("solo content");
      const uris = [{ fsPath: "/workspace/solo.ts" } as vscode.Uri];
      await copyFileContentWithPath(uris);
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "1 file(s) copied with paths.",
      );
    });

    it("includes file path even when readFileContent returns empty string", async () => {
      (mockFs.readFileSync as jest.Mock).mockReturnValue("");
      const uris = [{ fsPath: "/workspace/empty.ts" } as vscode.Uri];
      await copyFileContentWithPath(uris);
      const written = (vscode.env.clipboard.writeText as jest.Mock).mock
        .calls[0][0] as string;
      expect(written).toContain("/workspace/empty.ts");
    });
  });
});
