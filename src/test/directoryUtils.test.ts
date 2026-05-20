import fs from "fs";
import * as vscode from "vscode";
import {
  traverseDirectory,
  createDirectoriesRecursively,
} from "../directoryUtils";

jest.mock("fs");

const mockFs = jest.mocked(fs);

/** Helper to create a minimal Dirent-like object. */
function makeDirent(name: string): fs.Dirent {
  return { name } as unknown as fs.Dirent;
}

describe("directoryUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no .gitignore, all entries are plain files
    mockFs.existsSync.mockReturnValue(false);
    mockFs.statSync.mockReturnValue({
      isFile: () => true,
      isDirectory: () => false,
    } as unknown as fs.Stats);
  });

  describe("traverseDirectory", () => {
    it("returns empty string for an empty directory", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([]);
      const result = traverseDirectory("/dir", "/dir");
      expect(result).toBe("");
    });

    it("returns empty string and shows error when readdirSync throws", () => {
      (mockFs.readdirSync as jest.Mock).mockImplementation(() => {
        throw new Error("EACCES: permission denied");
      });
      const result = traverseDirectory("/dir", "/dir");
      expect(result).toBe("");
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });

    it("lists a single file entry", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([makeDirent("index.ts")]);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        isDirectory: () => false,
      } as unknown as fs.Stats);
      const result = traverseDirectory("/dir", "/dir");
      expect(result).toContain("index.ts");
    });

    it("places files after directories", () => {
      (mockFs.readdirSync as jest.Mock).mockImplementation((p: unknown) => {
        if (String(p) === "/dir") {
          return [makeDirent("src"), makeDirent("README.md")];
        }
        return [];
      });
      (mockFs.statSync as jest.Mock).mockImplementation((p: unknown) => ({
        isFile: () => !String(p).endsWith("src"),
        isDirectory: () => String(p).endsWith("src"),
      }));

      const result = traverseDirectory("/dir", "/dir");
      const srcIndex = result.indexOf("src");
      const readmeIndex = result.indexOf("README.md");
      expect(srcIndex).toBeGreaterThanOrEqual(0);
      expect(readmeIndex).toBeGreaterThanOrEqual(0);
      expect(srcIndex).toBeLessThan(readmeIndex);
    });

    it("recurses into subdirectories that have visible children", () => {
      (mockFs.readdirSync as jest.Mock).mockImplementation((p: unknown) => {
        if (String(p) === "/dir") {
          return [makeDirent("sub")];
        }
        return [makeDirent("child.ts")];
      });
      (mockFs.statSync as jest.Mock).mockImplementation((p: unknown) => ({
        isFile: () => !String(p).endsWith("sub"),
        isDirectory: () => String(p).endsWith("sub"),
      }));

      const result = traverseDirectory("/dir", "/dir");
      expect(result).toContain("sub");
      expect(result).toContain("child.ts");
    });

    it("does not recurse into empty subdirectories", () => {
      (mockFs.readdirSync as jest.Mock).mockImplementation((p: unknown) => {
        if (String(p) === "/dir") {
          return [makeDirent("emptyDir")];
        }
        return [];
      });
      mockFs.statSync.mockReturnValue({
        isFile: () => false,
        isDirectory: () => true,
      } as unknown as fs.Stats);

      const result = traverseDirectory("/dir", "/dir");
      expect(result).toContain("emptyDir");
    });

    it("skips entries that throw on stat", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([
        makeDirent("good.ts"),
        makeDirent("bad.ts"),
      ]);
      (mockFs.statSync as jest.Mock).mockImplementation((p: unknown) => {
        if (String(p).endsWith("bad.ts")) {
          throw new Error("stat failed");
        }
        return { isFile: () => true, isDirectory: () => false };
      });

      const result = traverseDirectory("/dir", "/dir");
      expect(result).toContain("good.ts");
    });
  });

  describe("createDirectoriesRecursively", () => {
    it("calls mkdirSync with recursive option and returns true", () => {
      mockFs.mkdirSync.mockReturnValue(undefined);
      const result = createDirectoriesRecursively("/some/nested/path");
      expect(result).toBe(true);
      expect(mockFs.mkdirSync).toHaveBeenCalledWith("/some/nested/path", {
        recursive: true,
      });
    });

    it("returns false and shows error when mkdirSync throws", () => {
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error("Permission denied");
      });
      const result = createDirectoriesRecursively("/some/path");
      expect(result).toBe(false);
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });

  // ─── traverseDirectory – additional edge cases ──────────────────────────────

  describe("traverseDirectory – edge cases", () => {
    it("handles symlinks by treating them based on stat result", () => {
      // Symlinks are resolved via statSync; if stat says file, treat as file
      (mockFs.readdirSync as jest.Mock).mockReturnValue([
        makeDirent("symlink-to-file"),
      ]);
      (mockFs.statSync as jest.Mock).mockReturnValue({
        isFile: () => true,
        isDirectory: () => false,
      });
      const result = traverseDirectory("/dir", "/dir");
      expect(result).toContain("symlink-to-file");
    });

    it("handles symlink to directory by recursing into it", () => {
      (mockFs.readdirSync as jest.Mock).mockImplementation((p: unknown) => {
        if (String(p) === "/dir") {
          return [makeDirent("symlink-dir")];
        }
        return [makeDirent("inner.ts")];
      });
      (mockFs.statSync as jest.Mock).mockImplementation((p: unknown) => ({
        isFile: () => String(p).endsWith(".ts"),
        isDirectory: () => !String(p).endsWith(".ts"),
      }));

      const result = traverseDirectory("/dir", "/dir");
      expect(result).toContain("symlink-dir");
      expect(result).toContain("inner.ts");
    });

    it("handles permission denied on a subdirectory (readdirSync throws)", () => {
      (mockFs.readdirSync as jest.Mock).mockImplementation((p: unknown) => {
        if (String(p) === "/dir") {
          return [makeDirent("restricted")];
        }
        // Attempting to read the restricted directory throws
        throw new Error("EACCES: permission denied");
      });
      (mockFs.statSync as jest.Mock).mockReturnValue({
        isFile: () => false,
        isDirectory: () => true,
      });

      // Should not throw; restricted dir has no visible children so not recursed
      const result = traverseDirectory("/dir", "/dir");
      expect(result).toContain("restricted");
    });

    it("handles very deep nesting (5 levels)", () => {
      // Build a chain: /dir -> d0 -> d1 -> d2 -> d3 -> d4 -> leaf.ts
      const depthDirs = ["/dir", "d0", "d1", "d2", "d3", "d4"];
      (mockFs.readdirSync as jest.Mock).mockImplementation((p: unknown) => {
        const s = String(p).replace(/\\/g, "/");
        for (let i = 0; i < depthDirs.length - 1; i++) {
          if (
            (i === 0 && s === "/dir") ||
            (i > 0 && s.endsWith("/" + depthDirs[i]))
          ) {
            return [makeDirent(depthDirs[i + 1])];
          }
        }
        // deepest level returns a file
        return [makeDirent("leaf.ts")];
      });
      (mockFs.statSync as jest.Mock).mockImplementation((p: unknown) => ({
        isFile: () => String(p).endsWith(".ts"),
        isDirectory: () => !String(p).endsWith(".ts"),
      }));

      const result = traverseDirectory("/dir", "/dir");
      expect(result).toContain("d0");
      expect(result).toContain("leaf.ts");
    });

    it("handles a directory with only ignored files (all filtered out)", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([
        makeDirent("node_modules"),
      ]);
      (mockFs.statSync as jest.Mock).mockReturnValue({
        isFile: () => false,
        isDirectory: () => true,
      });
      // Pass node_modules/ as additional ignore
      const result = traverseDirectory("/dir", "/dir", ["node_modules/"]);
      // The result should not contain node_modules
      expect(result).not.toContain("node_modules");
    });

    it("handles entries that are neither file nor directory (e.g., socket)", () => {
      (mockFs.readdirSync as jest.Mock).mockReturnValue([
        makeDirent("my.sock"),
        makeDirent("normal.ts"),
      ]);
      (mockFs.statSync as jest.Mock).mockImplementation((p: unknown) => ({
        isFile: () => String(p).endsWith(".ts"),
        isDirectory: () => false,
      }));

      const result = traverseDirectory("/dir", "/dir");
      // my.sock is not a file and not a directory, so it should be skipped
      expect(result).toContain("normal.ts");
      expect(result).not.toContain("my.sock");
    });

    it("sorts directories and files alphabetically", () => {
      (mockFs.readdirSync as jest.Mock).mockImplementation((p: unknown) => {
        if (String(p) === "/dir") {
          return [
            makeDirent("zebra.ts"),
            makeDirent("alpha.ts"),
            makeDirent("beta"),
            makeDirent("alpha-dir"),
          ];
        }
        return [];
      });
      (mockFs.statSync as jest.Mock).mockImplementation((p: unknown) => {
        const s = String(p);
        const isDir = s.endsWith("beta") || s.endsWith("alpha-dir");
        return {
          isFile: () => !isDir,
          isDirectory: () => isDir,
        };
      });

      const result = traverseDirectory("/dir", "/dir");
      const alphaDir = result.indexOf("alpha-dir");
      const beta = result.indexOf("beta");
      const alphaFile = result.indexOf("alpha.ts");
      const zebraFile = result.indexOf("zebra.ts");

      // Directories come first, sorted
      expect(alphaDir).toBeLessThan(beta);
      // Files come after directories, sorted
      expect(beta).toBeLessThan(alphaFile);
      expect(alphaFile).toBeLessThan(zebraFile);
    });
  });
});
