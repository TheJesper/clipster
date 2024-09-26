const { exec } = require("child_process");
const packageJson = require("./package.json");
const version = packageJson.version;

exec(
  `vsce package --out ./out/clipster-${version}.vsix`,
  (err, stdout, stderr) => {
    if (err) {
      console.error(`Error: ${err.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(`Success: ${stdout}`);
  }
);
