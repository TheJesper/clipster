const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

function activate(context) {
  vscode.window.showInformationMessage("Clipster activated!");
  // Command to copy the file content with the file path as the header
  let copyFileContentWithHeader = vscode.commands.registerCommand(
    "extension.copyFileContentWithHeader",
    async (fileUri) => {
      if (!fileUri || !fileUri.fsPath) {
        vscode.window.showErrorMessage("No file selected.");
        return;
      }
      const fileContent = fs.readFileSync(fileUri.fsPath, "utf8");
      const formattedContent = `📄 File Path: ${fileUri.fsPath}\n\n${fileContent}`;
      vscode.env.clipboard.writeText(formattedContent);
      vscode.window.showInformationMessage("File content copied with path.");
    }
  );

  // Command to copy folder structure
  let copyFolderStructure = vscode.commands.registerCommand(
    "extension.copyFolderStructure",
    async (folderUri) => {
      if (!folderUri || !folderUri.fsPath) {
        vscode.window.showErrorMessage("No folder selected.");
        return;
      }
      const getFolderStructureWithEmojis = (dir, indent = "📂 ") => {
        let structure = `${indent}${path.basename(dir)}\n`;
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const entryPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            structure += getFolderStructureWithEmojis(
              entryPath,
              `${indent}┣ 📂 `
            );
          } else {
            structure += `${indent}┣ 📄 ${entry.name}\n`;
          }
        }
        return structure;
      };

      const relativeStructure = getFolderStructureWithEmojis(folderUri.fsPath);
      const formattedContent = `📂 Full Path: ${folderUri.fsPath}\n\n${relativeStructure}`;
      vscode.env.clipboard.writeText(formattedContent);
      vscode.window.showInformationMessage("Folder structure copied.");
    }
  );

  // Command to copy folder structure and content
  let copyFolderStructureAndContent = vscode.commands.registerCommand(
    "extension.copyFolderStructureAndContent",
    async (folderUri) => {
      if (!folderUri || !folderUri.fsPath) {
        vscode.window.showErrorMessage("No folder selected.");
        return;
      }
      const getFolderStructureWithContent = (dir, indent = "📂 ") => {
        let structure = `${indent}${path.basename(dir)}\n`;
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const entryPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            structure += getFolderStructureWithContent(
              entryPath,
              `${indent}┣ 📂 `
            );
          } else {
            const fileContent = fs.readFileSync(entryPath, "utf8");
            structure += `${indent}┣ 📄 ${entry.name}\nContent:\n${fileContent}\n\n`;
          }
        }
        return structure;
      };

      const fullStructureWithContent = getFolderStructureWithContent(
        folderUri.fsPath
      );
      const formattedContent = `📂 Full Path: ${folderUri.fsPath}\n\n${fullStructureWithContent}`;
      vscode.env.clipboard.writeText(formattedContent);
      vscode.window.showInformationMessage(
        "Folder structure and content copied."
      );
    }
  );

  // Register commands
  context.subscriptions.push(
    copyFileContentWithHeader,
    copyFolderStructure,
    copyFolderStructureAndContent
  );
}

// Deactivation function
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
