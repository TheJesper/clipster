// test/suite/index.js
import path from "path";
import Mocha from "mocha";
import glob from "glob";

export function run() {
  // Create the Mocha test instance
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
  });

  const testsRoot = path.resolve(__dirname, "..");

  return new Promise((resolve, reject) => {
    glob("**/**.test.js", { cwd: testsRoot }, async (err, files) => {
      if (err) {
        return reject(err);
      }

      try {
        // Dynamically import each test file (ES modules)
        for (const file of files) {
          await import(path.resolve(testsRoot, file));
          mocha.addFile(path.resolve(testsRoot, file));
        }

        // Run the tests
        mocha.run((failures) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}
