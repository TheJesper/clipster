const fs = require("fs");
const { exec } = require("child_process");
const packageJson = require("./package.json");
const version = packageJson.version;
const path = "./out";

// Clear 'out' directory if it exists
if (fs.existsSync(path)) {
  fs.readdirSync(path).forEach((file) => {
    fs.unlinkSync(`${path}/${file}`);
  });
} else {
  // Create 'out' directory if it doesn't exist
  fs.mkdirSync(path);
}

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
