// test/runTest.mjs
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { runTests } from "@vscode/test-electron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "../");
    const extensionTestsPath = path.resolve(__dirname, "./suite/index.js");

    // Generate a unique user data directory path based on the current time
    const timestamp = Date.now();
    const userDataDir = path.resolve(
      __dirname,
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
