import { strict as assert } from "assert";
import { getFolderStructure, copyFileContentWithPath } from "../fileHelpers.js";
import mockFs from "mock-fs";
import { systemLineEnding } from "./helpers.js";

describe("File Helpers Tests", () => {
  beforeEach(() => {
    mockFs({
      "/mocked/workspace/project": {
        "file.txt": "File content",
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
      `📦 workspace\n🖥️ D:\\mocked\\workspace\\project\n\n📂 project\n┗ 📄 file.txt\n`
    );
    assert.equal(result, expected);
  });
});
