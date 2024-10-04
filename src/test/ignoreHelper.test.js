// File: src/test/fileHelpers.test.js
// Version: 1.0.4

import { strict as assert } from "assert";
import { getFolderStructure, copyFileContentWithPath } from "../fileHelpers.js";
import mockFs from "mock-fs";
import { systemLineEnding } from "./helpers.js";
import path from "path";

describe("File Helpers Tests", () => {
  beforeEach(() => {
    mockFs({
      "/mocked/workspace/project": {
        "file.txt": "File content",
        Ohoh: {
          "yalla.txt": `Hey this is the yalla content!
Hey this is the yalla content!
Hey this is the yalla content!
Hey this is the yalla content!
Hey this is the yalla content!`,
        },
      },
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("should get folder structure correctly", () => {
    const result = systemLineEnding(
      getFolderStructure("/mocked/workspace/project")
    );
    const expected = systemLineEnding(
      `📦 workspace
🖥️ ${path.join("D:", "mocked", "workspace", "project")}
📂 project
┣ 📂 Ohoh
┃ ┗ 📄 yalla.txt
┗ 📄 file.txt
`
    );
    assert.equal(result, expected);
  });

  it("should copy file content with path correctly", () => {
    const uri = { fsPath: "/mocked/workspace/project/Ohoh/yalla.txt" };
    const result = copyFileContentWithPath(uri);
    const expected = `${path.join(
      "/mocked",
      "workspace",
      "project",
      "Ohoh",
      "yalla.txt"
    )}${systemLineEnding("\r\n")}Hey this is the yalla content!
Hey this is the yalla content!
Hey this is the yalla content!
Hey this is the yalla content!
Hey this is the yalla content!`;
    assert.equal(systemLineEnding(result || ""), systemLineEnding(expected));
  });
});
