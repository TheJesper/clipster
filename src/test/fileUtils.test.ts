import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import {
  isFile,
  readFileContent,
  copyFileToClipboard,
  pasteFileFromClipboard,
} from "../fileUtils";

jest.mock("fs");

const mockFs = jest.mocked(fs);

describe("fileUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (vscode.env.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);
    (vscode.env.clipboard.readText as jest.Mock).mockResolvedValue("");
  });

  describe("isFile", () => {
    it("returns true when path points to a file", () => {
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
      } as unknown as fs.Stats);
      expect(isFile("/some/file.ts")).toBe(true);
    });

    it("returns false when path points to a directory", () => {
      mockFs.statSync.mockReturnValue({
        isFile: () => false,
      } as unknown as fs.Stats);
      expect(isFile("/some/dir")).toBe(false);
    });

    it("returns false when statSync throws", () => {
      mockFs.statSync.mockImplementation(() => {
        throw new Error("ENOENT");
      });
      expect(isFile("/nonexistent")).toBe(false);
    });
  });

  describe("readFileContent", () => {
    it("returns the file content as a string", () => {
      (mockFs.readFileSync as jest.Mock).mockReturnValue("file content here");
      const content = readFileContent("/path/to/file.ts");
      expect(content).toBe("file content here");
    });

    it("returns empty string and shows error when read fails", () => {
      (mockFs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error("ENOENT");
      });
      const content = readFileContent("/bad/path.ts");
      expect(content).toBe("");
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });

  describe("copyFileToClipboard", () => {
    it("writes the file path to the clipboard", async () => {
      const uri = { fsPath: "/workspace/src/index.ts" } as vscode.Uri;
      await copyFileToClipboard(uri);
      expect(vscode.env.clipboard.writeText).toHaveBeenCalledWith(
        "/workspace/src/index.ts"
      );
    });

    it("shows information message with the file basename", async () => {
      const uri = { fsPath: "/workspace/src/index.ts" } as vscode.Uri;
      await copyFileToClipboard(uri);
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "File copied: index.ts"
      );
    });

    it("shows error message when clipboard write fails", async () => {
      (vscode.env.clipboard.writeText as jest.Mock).mockRejectedValue(
        new Error("clipboard error")
      );
      const uri = { fsPath: "/workspace/src/index.ts" } as vscode.Uri;
      await copyFileToClipboard(uri);
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });

  describe("pasteFileFromClipboard", () => {
    it("shows error when clipboard content is not a valid file path", async () => {
      (vscode.env.clipboard.readText as jest.Mock).mockResolvedValue(
        "/nonexistent/path.ts"
      );
      mockFs.existsSync.mockReturnValue(false);
      const targetUri = { fsPath: "/workspace/dest" } as vscode.Uri;
      await pasteFileFromClipboard(targetUri);
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });

    it("copies the file to the target directory", async () => {
      const src = "/workspace/src/file.ts";
      const dest = "/workspace/dest";
      (vscode.env.clipboard.readText as jest.Mock).mockResolvedValue(src);
      mockFs.existsSync.mockImplementation((p) => {
        // source exists; destination does not yet
        return String(p) === src;
      });
      mockFs.copyFileSync.mockReturnValue(undefined);
      const targetUri = { fsPath: dest } as vscode.Uri;
      await pasteFileFromClipboard(targetUri);
      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        src,
        path.join(dest, "file.ts")
      );
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "File pasted: file.ts"
      );
    });

    it("shows warning when destination file already exists", async () => {
      const src = "/workspace/src/file.ts";
      const dest = "/workspace/dest";
      (vscode.env.clipboard.readText as jest.Mock).mockResolvedValue(src);
      mockFs.existsSync.mockReturnValue(true); // both source and dest "exist"
      const targetUri = { fsPath: dest } as vscode.Uri;
      await pasteFileFromClipboard(targetUri);
      expect(vscode.window.showWarningMessage).toHaveBeenCalled();
    });

    it("shows error when clipboard read throws", async () => {
      (vscode.env.clipboard.readText as jest.Mock).mockRejectedValue(
        new Error("clipboard error")
      );
      const targetUri = { fsPath: "/workspace/dest" } as vscode.Uri;
      await pasteFileFromClipboard(targetUri);
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });
});
