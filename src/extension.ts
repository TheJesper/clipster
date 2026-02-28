// src/extension.ts
import * as vscode from "vscode";
import path from "path";
import logger from "./logger";
import {
  getFolderStructure,
  getFolderStructureAndContent,
  copyRootFolderPath,
  copyRootFolderStructure,
  copyRootFolderStructureAndContent,
  copyFileContentWithPath,
  createFileOrFolderFromClipboard,
} from "./fileHelpers";
import { copyToClipboard } from "./clipboardHelper";
import {
  copyFileToClipboard,
  pasteFileFromClipboard,
  isFile,
} from "./fileUtils";

const MODULE = "extension";
let disposables: vscode.Disposable[] = [];

/**
 * Registers a command only when its corresponding setting is enabled.
 * configKey must be the SHORT key (without the "clipster." prefix) because
 * the configuration object is already scoped to "clipster".
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function registerConditionalCommand(
  commandName: string,
  configKey: string,
  handler: (...args: any[]) => any
): void {
  const config = vscode.workspace.getConfiguration("clipster");
  if (config.get<boolean>(configKey, true)) {
    disposables.push(vscode.commands.registerCommand(commandName, handler));
  }
}

function registerCommands(): void {
  logger.log("Registering Clipster commands…", MODULE, __filename);

  const config = vscode.workspace.getConfiguration("clipster");
  const additionalIgnores = config.get<string[]>("additionalIgnores", []);

  disposables.forEach((d) => d.dispose());
  disposables = [];

  // Copy / Paste File — each protected by its own setting
  registerConditionalCommand(
    "clipster.copyFile",
    "showCopyFile",
    async (uri: vscode.Uri) => {
      try {
        await copyFileToClipboard(uri);
      } catch (err) {
        vscode.window.showErrorMessage(
          `Failed to copy file: ${(err as Error).message}`
        );
        logger.error(
          `Failed to copy file: ${(err as Error).message}`,
          MODULE,
          __filename
        );
      }
    }
  );

  registerConditionalCommand(
    "clipster.pasteFile",
    "showPasteFile",
    async (uri: vscode.Uri) => {
      try {
        await pasteFileFromClipboard(uri);
      } catch (err) {
        vscode.window.showErrorMessage(
          `Failed to paste file: ${(err as Error).message}`
        );
        logger.error(
          `Failed to paste file: ${(err as Error).message}`,
          MODULE,
          __filename
        );
      }
    }
  );

  // Create File or Folder from Clipboard
  registerConditionalCommand(
    "clipster.createFileFromClipboard",
    "showCreateFileFromClipboard",
    async (uri: vscode.Uri) => {
      try {
        const clipboardContent = await vscode.env.clipboard.readText();
        const lines = clipboardContent
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        if (!lines.length) {
          throw new Error("Clipboard content is empty");
        }
        await createFileOrFolderFromClipboard(lines.join("\n"), uri);
      } catch (err) {
        vscode.window.showErrorMessage(
          `Failed to create files or folders: ${(err as Error).message}`
        );
        logger.error(
          `Failed to create files or folders: ${(err as Error).message}`,
          MODULE,
          __filename
        );
      }
    }
  );

  registerConditionalCommand(
    "clipster.copyFolderStructure",
    "showCopyFolderStructure",
    async (uri: vscode.Uri) => {
      try {
        if (!uri) throw new Error("No URI received for copyFolderStructure");
        const folderPath = isFile(uri.fsPath)
          ? path.dirname(uri.fsPath)
          : uri.fsPath;
        const result = getFolderStructure(folderPath, additionalIgnores);
        await copyToClipboard(result, "Folder structure copied.");
      } catch (err) {
        vscode.window.showErrorMessage(
          `Failed to copy folder structure: ${(err as Error).message}`
        );
        logger.error(
          `Failed to copy folder structure: ${(err as Error).message}`,
          MODULE,
          __filename
        );
      }
    }
  );

  // Fix: use registerConditionalCommand so the setting is respected
  registerConditionalCommand(
    "clipster.copyFolderStructureAndContent",
    "showCopyFolderStructureAndContent",
    async (uri: vscode.Uri) => {
      logger.log(
        `Received URI: ${JSON.stringify(uri)}`,
        "copyFolderStructureAndContent",
        __filename
      );

      if (!uri) {
        logger.error(
          "No URI received. Falling back to workspace root.",
          "copyFolderStructureAndContent",
          __filename
        );
        const fallback = vscode.workspace.workspaceFolders?.[0]?.uri;
        if (!fallback) {
          vscode.window.showErrorMessage(
            "No folder selected and no workspace found."
          );
          return;
        }
        uri = fallback;
      }

      try {
        const folderPath = isFile(uri.fsPath)
          ? path.dirname(uri.fsPath)
          : uri.fsPath;
        const result = getFolderStructureAndContent(folderPath, additionalIgnores);
        if (!result || result.trim() === path.basename(folderPath)) {
          vscode.window.showWarningMessage(
            "Folder is empty or all files are ignored."
          );
          return;
        }
        const lineCount = result.split("\n").length;
        const sizeKB = (Buffer.byteLength(result, "utf8") / 1024).toFixed(1);
        await copyToClipboard(
          result,
          `Copied ${lineCount} lines (${sizeKB} KB) to clipboard.`
        );
        logger.log(
          `Folder structure and content copied (${lineCount} lines, ${sizeKB} KB).`,
          "copyFolderStructureAndContent",
          __filename
        );
      } catch (err) {
        logger.error(
          `Error copying folder structure and content: ${(err as Error).message}`,
          "copyFolderStructureAndContent",
          __filename
        );
        vscode.window.showErrorMessage(
          `Failed to copy folder structure and content: ${(err as Error).message}`
        );
      }
    }
  );

  registerConditionalCommand(
    "clipster.copyRootFolderPath",
    "showCopyRootFolderPath",
    async () => {
      try {
        const rootPath = copyRootFolderPath();
        if (!rootPath.trim()) throw new Error("No valid workspace path found");
        await copyToClipboard(`Root Path: ${rootPath}`, "Root path copied.");
      } catch (err) {
        vscode.window.showErrorMessage((err as Error).message);
        logger.error((err as Error).message, MODULE, __filename);
      }
    }
  );

  registerConditionalCommand(
    "clipster.copyRootFolderStructure",
    "showCopyRootFolderStructure",
    async () => {
      try {
        const result = copyRootFolderStructure(additionalIgnores);
        await copyToClipboard(result, "Root folder structure copied.");
      } catch (err) {
        vscode.window.showErrorMessage(
          `Failed to copy root folder structure: ${(err as Error).message}`
        );
        logger.error(
          `Failed to copy root folder structure: ${(err as Error).message}`,
          MODULE,
          __filename
        );
      }
    }
  );

  registerConditionalCommand(
    "clipster.copyRootFolderStructureAndContent",
    "showCopyRootFolderStructureAndContent",
    async () => {
      try {
        const result = copyRootFolderStructureAndContent(additionalIgnores);
        await copyToClipboard(result, "Root folder structure and content copied.");
      } catch (err) {
        vscode.window.showErrorMessage(
          `Failed to copy root folder structure and content: ${(err as Error).message}`
        );
        logger.error(
          `Failed to copy root folder structure and content: ${(err as Error).message}`,
          MODULE,
          __filename
        );
      }
    }
  );

  registerConditionalCommand(
    "clipster.copyFileContentWithHeader",
    "showCopyFileContentWithHeader",
    async (uri: vscode.Uri, uris: vscode.Uri[]) => {
      try {
        const targets = Array.isArray(uris) ? uris : [uri];
        await copyFileContentWithPath(targets);
      } catch (err) {
        vscode.window.showErrorMessage(
          `Failed to copy file content with header: ${(err as Error).message}`
        );
        logger.error(
          `Failed to copy file content with header: ${(err as Error).message}`,
          MODULE,
          __filename
        );
      }
    }
  );

  logger.log("Commands registered.", MODULE, __filename);
}

export function activate(context: vscode.ExtensionContext): void {
  logger.log("Clipster is activating…", MODULE, __filename);
  registerCommands();

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("clipster")) {
        registerCommands();
      }
    }),
    new vscode.Disposable(() => disposables.forEach((d) => d.dispose()))
  );

  logger.log("Clipster activated.", MODULE, __filename);
}

export function deactivate(): void {
  logger.log("Clipster is deactivating…", MODULE, __filename);
  disposables.forEach((d) => d.dispose());
  disposables = [];
}
