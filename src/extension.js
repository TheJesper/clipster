const { commands, window, workspace } = require("vscode");
const { copyToClipboard } = require("../src/clipboardHelper");
const {
  getFolderStructure,
  getFolderStructureAndContent,
  copyRootFolderPath,
  copyRootFolderStructure,
  copyFileContentWithPath,
} = require("../src/fileHelpers");

const activate = (context) => {
  context.subscriptions.push(
    commands.registerCommand(
      "clipster.copyFileContentWithHeader",
      async (uri) => {
        try {
          const result = await copyFileContentWithPath(uri);
          await copyToClipboard(result);
          window.showInformationMessage("File content copied successfully!");
        } catch (error) {
          window.showErrorMessage(
            `Failed to copy file content: ${error.message}`
          );
        }
      }
    )
  );

  context.subscriptions.push(
    commands.registerCommand("clipster.copyFolderStructure", async (uri) => {
      try {
        const result = await getFolderStructure(uri.fsPath);
        await copyToClipboard(result);
        window.showInformationMessage("Folder structure copied successfully!");
      } catch (error) {
        window.showErrorMessage(
          `Failed to copy folder structure: ${error.message}`
        );
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand(
      "clipster.copyFolderStructureAndContent",
      async (uri) => {
        try {
          const result = await getFolderStructureAndContent(uri.fsPath);
          await copyToClipboard(result);
          window.showInformationMessage(
            "Folder structure and content copied successfully!"
          );
        } catch (error) {
          window.showErrorMessage(
            `Failed to copy folder structure and content: ${error.message}`
          );
        }
      }
    )
  );

  context.subscriptions.push(
    commands.registerCommand("clipster.copyRootFolderPath", async () => {
      try {
        const result = copyRootFolderPath();
        await copyToClipboard(result);
      } catch (error) {
        window.showErrorMessage(
          `Failed to copy root folder path: ${error.message}`
        );
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand("clipster.copyRootFolderStructure", async () => {
      try {
        const result = copyRootFolderStructure();
        await copyToClipboard(result);
      } catch (error) {
        window.showErrorMessage(
          `Failed to copy root folder structure: ${error.message}`
        );
      }
    })
  );
};

const deactivate = () => {
  console.log("Clipster extension deactivated.");
};

module.exports = { activate, deactivate };
