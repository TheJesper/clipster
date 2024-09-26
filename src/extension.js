const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const ignore = require("ignore");

const activate = (context) => {
  // Helper function to load ignore rules
  const loadIgnoreRules = (folderUri) => {
    const ig = ignore();
    try {
      const gitignorePath = path.join(folderUri.fsPath, ".gitignore");
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
        ig.add(gitignoreContent);
      }
    } catch (err) {
      console.error("Error loading .gitignore", err);
    }
    // Add default ignores (e.g., node_modules)
    ig.add(["node_modules", "dist", "cypress-report", ".git"]);
    return ig;
  };

  // Command to copy the content of a file along with the file path
  let copyFileContentWithHeader = vscode.commands.registerCommand(
    "extension.copyFileContentWithHeader",
    async (fileUri) => {
      const fileContent = fs.readFileSync(fileUri.fsPath, "utf8");
      const formattedContent = `📄 File Path: ${fileUri.fsPath}\n\n${fileContent}`;
      vscode.env.clipboard.writeText(formattedContent);
      vscode.window.showInformationMessage("File content copied with path.");
    }
  );

  // Command to copy folder structure with relative paths and emojis
  let copyFolderStructure = vscode.commands.registerCommand(
    "extension.copyFolderStructure",
    async (folderUri) => {
      const ig = loadIgnoreRules(folderUri);
      const getFolderStructureWithEmojis = (dir, indent = "📂 ") => {
        let structure = `${indent}${path.basename(dir)}\n`;
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const entryPath = path.join(dir, entry.name);
          if (!ig.ignores(entry.name)) {
            if (entry.isDirectory()) {
              structure += getFolderStructureWithEmojis(
                entryPath,
                `${indent}┣ 📂 `
              );
            } else {
              structure += `${indent}┣ 📄 ${entry.name}\n`;
            }
          }
        }
        return structure;
      };

      const fullPath = folderUri.fsPath;
      const relativeStructure = getFolderStructureWithEmojis(folderUri.fsPath);
      const formattedContent = `📂 Full Path: ${fullPath}\n\n${relativeStructure}`;
      vscode.env.clipboard.writeText(formattedContent);
      vscode.window.showInformationMessage("Folder structure copied.");
    }
  );

  // Command to copy folder structure and file content
  let copyFolderStructureAndContent = vscode.commands.registerCommand(
    "extension.copyFolderStructureAndContent",
    async (folderUri) => {
      const ig = loadIgnoreRules(folderUri);
      const getFolderStructureWithContent = (dir, indent = "📂 ") => {
        let structure = `${indent}${path.basename(dir)}\n`;
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const entryPath = path.join(dir, entry.name);
          if (!ig.ignores(entry.name)) {
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
        }
        return structure;
      };

      const fullPath = folderUri.fsPath;
      const fullStructureWithContent = getFolderStructureWithContent(
        folderUri.fsPath
      );
      const formattedContent = `📂 Full Path: ${fullPath}\n\n${fullStructureWithContent}`;
      vscode.env.clipboard.writeText(formattedContent);
      vscode.window.showInformationMessage(
        "Folder structure and content copied."
      );
    }
  );

  // Command to copy the root folder structure
  let copyRootStructure = vscode.commands.registerCommand(
    "extension.copyRootStructure",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage("No workspace folder found.");
        return;
      }

      const rootFolderUri = workspaceFolders[0].uri;
      await copyFolderStructure(rootFolderUri); // Reuse the existing function
    }
  );

  // Add commands to the subscriptions
  context.subscriptions.push(
    copyFileContentWithHeader,
    copyFolderStructure,
    copyFolderStructureAndContent,
    copyRootStructure
  );
};

const deactivate = () => {};

module.exports = {
  activate,
  deactivate,
};
