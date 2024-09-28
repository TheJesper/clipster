const { commands, workspace, window, Disposable } = require("vscode");
const { copyToClipboard } = require("./clipboardHelper");
const {
  getFolderStructure,
  getFolderStructureAndContent,
  copyRootFolderPath,
  copyRootFolderStructure,
} = require("./fileHelpers");

let disposables = [];

// Register commands function
const registerCommands = () => {
  console.log("Registering Clipster commands...");
  const config = workspace.getConfiguration("clipster");
  const additionalIgnores = config.get("additionalIgnores", []);

  // Clear existing disposables (commands)
  disposables.forEach((disposable) => disposable.dispose());
  disposables = [];

  if (config.get("showCopyFileContentWithHeader", true)) {
    disposables.push(
      commands.registerCommand(
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
      commands.registerCommand("clipster.copyFolderStructure", async (uri) => {
        const result = await getFolderStructure(uri.fsPath, additionalIgnores);
        await copyToClipboard(
          result,
          "📁 Folder structure copied successfully!"
        );
      })
    );
  }

  if (config.get("showCopyFolderStructureAndContent", true)) {
    disposables.push(
      commands.registerCommand(
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
              window.showErrorMessage(
                "Failed to retrieve folder structure and content."
              );
            }
          } catch (error) {
            window.showErrorMessage(
              `Error copying folder structure and content: ${error.message}`
            );
          }
        }
      )
    );
  }

  if (config.get("showCopyRootFolderPath", true)) {
    disposables.push(
      commands.registerCommand("clipster.copyRootFolderPath", async () => {
        const result = copyRootFolderPath();
        await copyToClipboard(
          result,
          "📁 Root folder path copied successfully!"
        );
      })
    );
  }

  if (config.get("showCopyRootFolderStructure", true)) {
    disposables.push(
      commands.registerCommand("clipster.copyRootFolderStructure", async () => {
        const result = copyRootFolderStructure(additionalIgnores);
        await copyToClipboard(
          result,
          "📁 Root folder structure copied successfully!"
        );
      })
    );
  }
};

// Activation function
const activate = (context) => {
  console.log("Activating Clipster..."); // Log activation for debugging
  window.showInformationMessage("Clipster extension activated successfully!");

  // Register initial commands based on current configuration
  registerCommands();

  // Listen for configuration changes and re-register commands accordingly
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("clipster")) {
        registerCommands(); // Re-register commands when configuration changes
      }
    })
  );

  // Dispose all commands when deactivating
  context.subscriptions.push(
    new Disposable(() => {
      disposables.forEach((disposable) => disposable.dispose());
    })
  );
};

// Deactivation function
const deactivate = () => {
  console.log("Clipster extension deactivated.");
};

module.exports = { activate, deactivate };
