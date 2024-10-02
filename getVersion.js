// src/getVersion.js
import { writeFileSync } from "fs";
import packageJson from "./package.json" assert { type: "json" };

writeFileSync(".version", packageJson.version);
