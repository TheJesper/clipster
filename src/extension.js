const { commands, workspace, window, Disposable } = require("vscode");
const { copyToClipboard } = require("./clipboardHelper");
const {
  getFolderStructure,
  getFolderStructureAndContent,
  copyRootFolderPath,
  copyRootFolderStructure,
} = require("./fileHelpers");

let disposables = [];

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

const activate = (context) => {
  // Show activation message
  console.log("Activating Clipster..."); // Ensure this gets logged
  window.showInformationMessage("Clipster extension activated successfully!");

  // Register initial commands based on current configuration
  registerCommands();

  // Listen for configuration changes
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

const deactivate = () => {
  console.log("Clipster extension deactivated.");
};

module.exports = { activate, deactivate };
