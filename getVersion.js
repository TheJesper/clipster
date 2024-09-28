// src\getVersion.js
const fs = require("fs");
const packageJson = require("./package.json");
fs.writeFileSync(".version", packageJson.version);
