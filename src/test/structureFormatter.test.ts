import os from "os";
import * as vscode from "vscode";
import { formatStructure, formatRootFolder } from "../structureFormatter";

describe("structureFormatter", () => {
  beforeEach(() => {
    // Default: emojis enabled
    (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
      get: jest.fn((_key: string, defaultVal: unknown) => defaultVal),
    });
  });

  describe("formatStructure (emojis on)", () => {
    it("formats last file with ┗ prefix and 📄 icon", () => {
      const result = formatStructure("file.ts", "file", "", true);
      expect(result).toBe(`┗ 📄 file.ts${os.EOL}`);
    });

    it("formats non-last file with ┣ prefix and 📄 icon", () => {
      const result = formatStructure("file.ts", "file", "", false);
      expect(result).toBe(`┣ 📄 file.ts${os.EOL}`);
    });

    it("formats folder with 📁 icon", () => {
      const result = formatStructure("src", "folder", "", false);
      expect(result).toBe(`┣ 📁 src${os.EOL}`);
    });

    it("includes indent before prefix", () => {
      const result = formatStructure("file.ts", "file", "  ", true);
      expect(result).toBe(`  ┗ 📄 file.ts${os.EOL}`);
    });
  });

  describe("formatStructure (emojis off)", () => {
    beforeEach(() => {
      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
        get: jest.fn((_key: string, _defaultVal: unknown) => false),
      });
    });

    it("formats without emoji icons", () => {
      const result = formatStructure("file.ts", "file", "", true);
      expect(result).toBe(`┗ file.ts${os.EOL}`);
    });

    it("formats folder without emoji", () => {
      const result = formatStructure("src", "folder", "┃ ", false);
      expect(result).toBe(`┃ ┣ src${os.EOL}`);
    });
  });

  describe("formatRootFolder", () => {
    it("formats root folder header with emoji", () => {
      const result = formatRootFolder("myProject", "/path/to/myProject");
      expect(result).toBe(`🖥️ myProject${os.EOL}Path: /path/to/myProject${os.EOL}`);
    });

    it("formats root folder without emoji when disabled", () => {
      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
        get: jest.fn((_key: string, _defaultVal: unknown) => false),
      });
      const result = formatRootFolder("clipster", "/home/user/clipster");
      expect(result).toBe(`clipster${os.EOL}Path: /home/user/clipster${os.EOL}`);
    });
  });
});
