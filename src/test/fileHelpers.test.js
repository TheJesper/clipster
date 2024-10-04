// File: src/test/fileHelpers.test.js
// Version: 2.1.1

import { strict as assert } from "assert";
import {
  getFolderStructure,
  copyFileContentWithPath,
  copyRootFolderWithContent,
} from "../fileHelpers.js";
import mockFs from "mock-fs";
import {
  systemLineEnding,
  normalizeSlashes,
  getSystemLineEnding,
} from "./helpers.js";
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
      normalizeSlashes(getFolderStructure("/mocked/workspace/project"))
    );
    const expected = systemLineEnding(
      `📦 workspace
🖥️ ${normalizeSlashes(
        path.join("/mocked", "workspace", "project")
      )}${getSystemLineEnding()}📂 project${getSystemLineEnding()}┣ 📂 Ohoh${getSystemLineEnding()}┃ ┗ 📄 yalla.txt${getSystemLineEnding()}┗ 📄 file.txt${getSystemLineEnding()}`
    );

    assert.equal(result, expected);
  });

  it("should copy file content with path correctly", () => {
    const uri = { fsPath: "/mocked/workspace/project/Ohoh/yalla.txt" };
    const result = systemLineEnding(
      normalizeSlashes(copyFileContentWithPath(uri))
    );
    const expected = systemLineEnding(
      `${normalizeSlashes(
        path.join("/mocked", "workspace", "project", "Ohoh", "yalla.txt")
      )}${getSystemLineEnding()}Hey this is the yalla content!
Hey this is the yalla content!
Hey this is the yalla content!
Hey this is the yalla content!
Hey this is the yalla content!`
    );

    assert.equal(result, expected);
  });

  it("should normalize slashes correctly", () => {
    const inputPath = "/mocked/workspace/project/Ohoh/yalla.txt";
    const expectedPath = path.join(
      "mocked",
      "workspace",
      "project",
      "Ohoh",
      "yalla.txt"
    );

    const result = normalizeSlashes(inputPath);
    const expected = normalizeSlashes(expectedPath);

    assert.equal(result, expected);
  });

  it("should copy root folder with content correctly", () => {
    const rootPath = "/mocked/workspace/project";
    const result = systemLineEnding(
      normalizeSlashes(copyRootFolderWithContent(rootPath))
    );
    const expected = systemLineEnding(
      `📦 workspace
🖥️ ${normalizeSlashes(
        path.join("/mocked", "workspace", "project")
      )}${getSystemLineEnding()}📂 project${getSystemLineEnding()}┣ 📂 Ohoh${getSystemLineEnding()}┃ ┗ 📄 yalla.txt${getSystemLineEnding()}┗ 📄 file.txt${getSystemLineEnding()}File content: File content${getSystemLineEnding()}`
    );

    assert.equal(result, expected);
  });
});
