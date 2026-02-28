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
  });
});
