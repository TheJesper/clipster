// File: src/logger.js
// Version: 1.0.3

let isVsCode = false;
let outputChannel = null;

try {
  const vscode = require("vscode");
  isVsCode = typeof vscode !== "undefined" && vscode.window;
  if (isVsCode) {
    outputChannel = vscode.window.createOutputChannel("Clipster Logger");
  }
} catch (error) {
  isVsCode = false;
}

// Create a logger utility to handle logging in both VS Code and test environments
const logger = {
  log: (message) => {
    if (isVsCode && outputChannel) {
      outputChannel.appendLine(message);
    } else {
      console.log(message);
    }
  },
  error: (message) => {
    if (isVsCode && outputChannel) {
      outputChannel.appendLine(`[ERROR] ${message}`);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
};

export default logger;
