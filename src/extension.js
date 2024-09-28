const { commands, workspace, window } = require("vscode");
const { copyToClipboard } = require("./clipboardHelper");
const {
  getFolderStructure,
  getFolderStructureAndContent,
  copyRootFolderPath,
  copyRootFolderStructure,
} = require("./fileHelpers");

// Register commands in the `activate` function
const activate = (context) => {
  const config = workspace.getConfiguration("clipster");
  const showMenuOptions = config.get("showMenuOptions", true);
  const additionalIgnores = config.get("additionalIgnores", []);

  if (showMenuOptions) {
    if (config.get("showCopyFileContentWithHeader", true)) {
      context.subscriptions.push(
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
      context.subscriptions.push(
        commands.registerCommand(
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
      context.subscriptions.push(
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
      context.subscriptions.push(
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
      context.subscriptions.push(
        commands.registerCommand(
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
  } else {
    window.showInformationMessage("Clipster menu options are disabled.");
  }
};

const deactivate = () => {
  console.log("Clipster extension deactivated.");
};

module.exports = { activate, deactivate };
