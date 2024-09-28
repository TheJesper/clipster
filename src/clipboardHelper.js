const { env, window } = require("vscode");

const copyToClipboard = async (
  text,
  successMessage = "📁 Copied to clipboard!",
  errorMessage = "Failed to copy to clipboard."
) => {
  try {
    await env.clipboard.writeText(text);
    window.showInformationMessage(successMessage);
  } catch (error) {
    window.showErrorMessage(errorMessage);
  }
};

module.exports = { copyToClipboard };
