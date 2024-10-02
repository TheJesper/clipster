// test/runTest.mjs
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { runTests } from "@vscode/test-electron";

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(dirName, "../");
    const extensionTestsPath = path.resolve(dirName, "./suite/index.js");

    // Generate a unique user data directory path based on the current time
    const timestamp = Date.now();
    const userDataDir = path.resolve(
      dirName,
      `./.vscode-test-userdata-${timestamp}`
    );

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath: pathToFileURL(extensionTestsPath).href,
      launchArgs: ["--disable-extensions", `--user-data-dir=${userDataDir}`],
    });
  } catch (err) {
    console.error("Failed to run tests");
    console.error(err);
    process.exit(1);
  }
}

main();
