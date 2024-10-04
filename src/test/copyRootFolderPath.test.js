import { strict as assert } from "assert";
import { copyRootFolderPath } from "../fileHelpers.js";
import { copyToClipboard } from "../clipboardHelper.js";
import sinon from "sinon";
import * as vscode from "vscode";

describe("Copy Root Folder Path Tests", () => {
  let clipboardStub;
  let showInfoMessageStub;
  let showErrorMessageStub;

  beforeEach(() => {
    // Stubbing VSCode clipboard and message functions
    clipboardStub = sinon.stub(vscode.env.clipboard, "writeText");
    showInfoMessageStub = sinon.stub(vscode.window, "showInformationMessage");
    showErrorMessageStub = sinon.stub(vscode.window, "showErrorMessage");
  });

  afterEach(() => {
    sinon.restore(); // Restore the stubs after each test
  });

  it("should copy the root folder path successfully", async () => {
    const expectedPath = "📁 Root Path: /mocked/workspace";
    clipboardStub.resolves(); // Simulate successful clipboard copy

    const result = copyRootFolderPath();
    await copyToClipboard(result, "📁 Root folder path copied successfully!");

    // Assert that clipboard was called with the correct path
    sinon.assert.calledWith(clipboardStub, expectedPath);

    // Assert that the success message was displayed
    sinon.assert.calledWith(
      showInfoMessageStub,
      "📁 Root folder path copied successfully!"
    );
  });

  it("should show error if copy fails", async () => {
    clipboardStub.rejects(); // Simulate failure to copy to clipboard

    const result = copyRootFolderPath();
    await copyToClipboard(result, "📁 Root folder path copied successfully!");

    // Assert that the error message was displayed
    sinon.assert.calledWith(
      showErrorMessageStub,
      "Failed to copy to clipboard."
    );
  });
});
