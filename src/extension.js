// src/extension.js
const vscode = require("vscode");
const { copyToClipboard } = require("./clipboardHelper");
const {
  getFolderStructure,
  getFolderStructureAndContent,
  copyRootFolderPath,
  copyRootFolderStructure,
  copyFileContentWithPath,
} = require("./fileHelpers");

let disposables = [];

// Register commands function
const registerCommands = () => {
  console.log("Registering Clipster commands...");
  const config = vscode.workspace.getConfiguration("clipster");
  const additionalIgnores = config.get("additionalIgnores", []);

  // Clear existing disposables (commands)
  disposables.forEach((disposable) => disposable.dispose());
  disposables = [];

  if (config.get("showCopyFileContentWithHeader", true)) {
    disposables.push(
      vscode.commands.registerCommand(
        "clipster.copyFileContentWithHeader",
        async (uri) => {
          const result = await copyFileContentWithPath(uri);
          await copyToClipboard(
            result,
            "📝 File content with path copied successfully!"
          );
        }
      )
    );
  }

  if (config.get("showCopyFolderStructure", true)) {
    disposables.push(
      vscode.commands.registerCommand(
        "clipster.copyFolderStructure",
        async (uri) => {
          const result = await getFolderStructure(
            uri.fsPath,
            additionalIgnores
          );
          await copyToClipboard(
            result,
            "📁 Folder structure copied successfully!"
          );
        }
      )
    );
  }

  if (config.get("showCopyFolderStructureAndContent", true)) {
    disposables.push(
      vscode.commands.registerCommand(
        "clipster.copyFolderStructureAndContent",
        async (uri) => {
          try {
            const result = await getFolderStructureAndContent(
              uri.fsPath,
              additionalIgnores
            );
            if (result) {
              await copyToClipboard(
                result,
                "📁 Folder structure and content copied successfully!"
              );
            } else {
              vscode.window.showErrorMessage(
                "Failed to retrieve folder structure and content."
              );
            }
          } catch (error) {
            vscode.window.showErrorMessage(
              `Error copying folder structure and content: ${error.message}`
            );
          }
        }
      )
    );
  }

  if (config.get("showCopyRootFolderPath", true)) {
    disposables.push(
      vscode.commands.registerCommand(
        "clipster.copyRootFolderPath",
        async () => {
          const result = copyRootFolderPath();
          await copyToClipboard(
            result,
            "📁 Root folder path copied successfully!"
          );
        }
      )
    );
  }

  if (config.get("showCopyRootFolderStructure", true)) {
    disposables.push(
      vscode.commands.registerCommand(
        "clipster.copyRootFolderStructure",
        async () => {
          const result = copyRootFolderStructure(additionalIgnores);
          await copyToClipboard(
            result,
            "📁 Root folder structure copied successfully!"
          );
        }
      )
    );
  }
};

// Activation function
function activate(context) {
  console.log("Activating Clipster...");
  vscode.window.showInformationMessage(
    "Clipster extension activated successfully!"
  );

  // Register initial commands based on current configuration
  registerCommands();

  // Listen for configuration changes and re-register commands accordingly
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("clipster")) {
        registerCommands(); // Re-register commands when configuration changes
      }
    })
  );

  // Dispose all commands when deactivating
  context.subscriptions.push(
    new vscode.Disposable(() => {
      disposables.forEach((disposable) => disposable.dispose());
    })
  );
}

// Deactivation function
function deactivate() {
  console.log("Clipster extension deactivated.");
}

module.exports = {
  activate,
  deactivate,
};
