// build.js
const { execSync } = require("child_process");
const {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
} = require("fs");
const path = require("path");

// Paths to package.json and contributes.json
const packageJsonPath = path.join(path.resolve(), "package.json");
const contributesJsonPath = path.join(path.resolve(), "contributes.json");
const outDir = path.join(path.resolve(), "out"); // Ensure the output directory exists

// Step 1: Merge contributes.json into package.json
const mergeContributes = () => {
  console.log("Merging contributes.json into package.json...");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const contributesJson = JSON.parse(readFileSync(contributesJsonPath, "utf8"));

  // Merge contributes section
  packageJson.contributes = contributesJson;

  // Write updated package.json back to disk
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("Contributes section merged into package.json.");
};

// Step 2: Package the VSIX extension
const packageExtension = () => {
  try {
    // Ensure output directory exists after cleaning
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }

    // Specify output directory for the package
    const version = JSON.parse(readFileSync(packageJsonPath, "utf8")).version;
    execSync(
      `vsce package --out ${path.join(outDir, `clipster-${version}.vsix`)}`,
      {
        stdio: "inherit",
      }
    );
    console.log("Extension packaged successfully.");
  } catch (error) {
    console.error("Failed to package extension:", error);
    process.exit(1);
  }
};

// Step 3: Install the latest VSIX file from the 'out' directory
const installLatestVsix = () => {
  const vsixFiles = readdirSync(outDir).filter((file) =>
    file.endsWith(".vsix")
  );

  if (vsixFiles.length === 0) {
    console.error("No .vsix files found in 'out' directory.");
    process.exit(1);
  }

  // Sort the files by last modified time
  vsixFiles.sort((a, b) => {
    const aTime = statSync(path.join(outDir, a)).mtime;
    const bTime = statSync(path.join(outDir, b)).mtime;
    return bTime - aTime;
  });

  // Get the latest .vsix file
  const latestVsix = vsixFiles[0];
  console.log(`Installing extension: ${latestVsix}`);

  try {
    // Run the VS Code command to install the extension
    execSync(`code --install-extension ${path.join(outDir, latestVsix)}`, {
      stdio: "inherit",
    });
    console.log(`Successfully installed: ${latestVsix}`);
  } catch (error) {
    console.error(`Failed to install: ${latestVsix}`);
    console.error(error);
    process.exit(1);
  }
};

// Execute the steps
mergeContributes();
packageExtension();
installLatestVsix();
