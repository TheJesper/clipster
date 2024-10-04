const vscode = require("vscode");
const {
  getFolderStructure,
  getFolderStructureAndContent,
  copyRootFolderPath,
  copyRootFolderStructure,
  copyFileContentWithPath,
} = require("./fileHelpers.js");
const { copyToClipboard } = require("./clipboardHelper.js");

let disposables = [];

// Register commands function
const registerCommands = () => {
  console.log("Registering Clipster commands...");
  const config = vscode.workspace.getConfiguration("clipster");
  const additionalIgnores = config.get("additionalIgnores", []);

  // Clear existing disposables (commands)
  disposables.forEach((disposable) => disposable.dispose());
  disposables = [];

  // Register Copy File Content With Header
  if (config.get("clipster.showCopyFileContentWithHeader", true)) {
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

  // Register Copy Folder Structure
  if (config.get("clipster.showCopyFolderStructure", true)) {
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

  // Register Copy Folder Structure And Content
  if (config.get("clipster.showCopyFolderStructureAndContent", true)) {
    disposables.push(
      vscode.commands.registerCommand(
        "clipster.copyFolderStructureAndContent",
        async (uri) => {
          const result = await getFolderStructureAndContent(
            uri.fsPath,
            additionalIgnores
          );
          await copyToClipboard(
            result,
            "📁 Folder structure and content copied successfully!"
          );
        }
      )
    );
  }

  // Register Copy Root Folder Path
  if (config.get("clipster.showCopyRootFolderPath", true)) {
    disposables.push(
      vscode.commands.registerCommand(
        "clipster.copyRootFolderPath",
        async () => {
          try {
            const result = copyRootFolderPath();
            console.log("Result from copyRootFolderPath:", result);
            await copyToClipboard(
              result,
              "📁 Root folder path copied successfully!"
            );
          } catch (error) {
            console.error("Error during copyRootFolderPath:", error);
            vscode.window.showErrorMessage("Failed to copy root folder path.");
          }
        }
      )
    );
  }

  // Register Copy Root Folder Structure
  if (config.get("clipster.showCopyRootFolderStructure", true)) {
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
  console.log("Deactivating Clipster...");

  // Dispose of all registered commands or event listeners
  disposables.forEach((disposable) => disposable.dispose());
  disposables = [];

  // Additional cleanup if needed
}

// Export the activate and deactivate functions
module.exports = {
  activate,
  deactivate,
};
