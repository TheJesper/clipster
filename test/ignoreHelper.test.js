// test/ignoreHelper.test.js
import { strict as assert } from "assert";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { filterIgnoredFiles } from "../src/ignoreHelper.js";
import mockFs from "mock-fs";
import { describe, it, beforeEach, afterEach } from "mocha";

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

describe("Ignore Helper Tests", () => {
  beforeEach(() => {
    // Mocking file structure.
    mockFs({
      "/mocked/workspace/project": {
        "index.js": "",
        node_modules: {
          "file1.js": "",
          "package.json": "",
          ".bin": {
            "script.js": "",
          },
        },
        ".git": {
          config: "",
        },
        "test.js": "",
        "readme.md": "",
        ".DS_Store": "",
        ".gitignore": "",
        "README.md": "",
        "file1.js": "",
        "file2.txt": "",
        ".vscode": {
          "settings.json": "",
        },
        "temp.log": "",
        src: {
          "main.js": "",
        },
        lib: {
          "library.js": "",
        },
        test: {
          "test.js": "",
        },
        dist: {
          "app.min.js": "",
        },
        "app.vsix": "",
        "server.log": "",
        "yarn.lock": "",
        out: {
          "app.vsix": "",
        },
        "clipster.vsix": "",
      },
      // Mock the workspace directory used in tests
      [path.join(dirName, "workspace")]: {
        "index.js": "",
        "app.vsix": "",
        "server.log": "",
        "yarn.lock": "",
        out: {
          "app.vsix": "",
        },
        "clipster.vsix": "",
        node_modules: {
          "file1.js": "",
          "package.json": "",
          ".bin": {
            "script.js": "",
          },
        },
        ".DS_Store": "",
        ".gitignore": "",
        "README.md": "",
        "file1.js": "",
        "file2.txt": "",
        ".vscode": {
          "settings.json": "",
        },
        ".git": {
          config: "",
        },
        "temp.log": "",
        src: {
          "main.js": "",
        },
        lib: {
          "library.js": "",
        },
        test: {
          "test.js": "",
        },
        dist: {
          "app.min.js": "",
        },
      },
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("should filter out node_modules, .git, and .vscode folders", () => {
    const dir = "/mocked/workspace/project";
    const files = [
      "index.js",
      "node_modules/",
      ".git/",
      "test.js",
      "readme.md",
    ];
    const additionalIgnores = ["node_modules/", ".git/"];
    const result = filterIgnoredFiles(dir, files, dir, additionalIgnores);

    assert.deepStrictEqual(result, ["index.js", "test.js", "readme.md"]);
  });

  it("should ignore specific file types like *.vsix, *.log, and exclude specific folders", () => {
    const dir = path.join(dirName, "workspace");
    const files = [
      "index.js",
      "app.vsix",
      "server.log",
      "yarn.lock",
      "out/",
      "clipster.vsix",
    ];
    const additionalIgnores = ["**/*.vsix", "*.log", "out/**", "yarn.lock"];

    const filtered = filterIgnoredFiles(dir, files, dir, additionalIgnores);
    assert.deepStrictEqual(filtered, ["index.js"]);
  });

  it("should include only necessary files from node_modules and exclude others", () => {
    const dir = path.join(dirName, "workspace");
    const files = [
      "index.js",
      "node_modules/file1.js",
      "node_modules/package.json",
      ".DS_Store",
    ];
    const additionalIgnores = [
      "node_modules/**",
      "!node_modules/package.json",
      ".DS_Store",
    ];

    const filtered = filterIgnoredFiles(dir, files, dir, additionalIgnores);
    assert.deepStrictEqual(filtered, ["index.js", "node_modules/package.json"]);
  });

  it("should handle hidden files and system files like .DS_Store", () => {
    const dir = path.join(dirName, "workspace");
    const files = ["index.js", ".DS_Store", ".gitignore", "README.md"];
    const additionalIgnores = [".DS_Store", ".gitignore"];

    const filtered = filterIgnoredFiles(dir, files, dir, additionalIgnores);
    assert.deepStrictEqual(filtered, ["index.js", "README.md"]);
  });

  it("should apply both .gitignore, .vscodeignore, and additional settings", () => {
    const dir = path.join(dirName, "workspace");
    const files = [
      "file1.js",
      "file2.txt",
      ".vscode/",
      ".vscode/settings.json",
      ".git/config",
      "yarn.lock",
      "out/",
      "out/app.vsix",
      "temp.log",
    ];

    const gitignorePatterns = ["*.txt", "out/**", ".vscode/**"];
    const vscodeignorePatterns = ["yarn.lock", "**/*.vsix"];
    const additionalIgnores = ["*.log"];
    const allIgnores = [
      ...gitignorePatterns,
      ...vscodeignorePatterns,
      ...additionalIgnores,
    ];

    const filtered = filterIgnoredFiles(dir, files, dir, allIgnores);
    assert.deepStrictEqual(filtered, ["file1.js", ".git/config"]);
  });

  it("should handle complex patterns in additional ignore settings", () => {
    const dir = path.join(dirName, "workspace");
    const files = [
      "src/main.js",
      "lib/library.js",
      "node_modules/",
      "node_modules/.bin/",
      "node_modules/.bin/script.js",
      "test/",
      "test/test.js",
      "dist/",
      "dist/app.min.js",
    ];

    const additionalIgnores = [
      "node_modules/**",
      "!node_modules/.bin/**",
      "test/**",
      "dist/**",
    ];

    const filtered = filterIgnoredFiles(dir, files, dir, additionalIgnores);
    assert.deepStrictEqual(filtered, [
      "src/main.js",
      "lib/library.js",
      "node_modules/.bin/",
      "node_modules/.bin/script.js",
    ]);
  });
});
