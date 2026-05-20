#!/usr/bin/env node

const { execSync } = require("child_process");
const readline = require("readline");
const path = require("path");
const fs = require("fs");

// ── Colors ──────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  yellow: "\x1b[33m",
  gold: "\x1b[38;5;220m",
  amber: "\x1b[38;5;214m",
  orange: "\x1b[38;5;208m",
  white: "\x1b[97m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  bgYellow: "\x1b[43m",
};

const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

// ── Logo ────────────────────────────────────────────────────
function printLogo() {
  console.clear();
  console.log(`
${C.gold}${C.bold}     ██████╗██╗     ██╗██████╗ ███████╗████████╗███████╗██████╗
    ██╔════╝██║     ██║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗
    ██║     ██║     ██║██████╔╝███████╗   ██║   █████╗  ██████╔╝
    ██║     ██║     ██║██╔═══╝ ╚════██║   ██║   ██╔══╝  ██╔══██╗
    ╚██████╗███████╗██║██║     ███████║   ██║   ███████╗██║  ██║
     ╚═════╝╚══════╝╚═╝╚═╝     ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝${C.reset}
${C.amber}    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}
${C.yellow}     Copy. Paste. Share with AI.${C.dim}                    v${pkg.version}${C.reset}
${C.amber}    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}
`);
}

// ── Menu Items ──────────────────────────────────────────────
const MENU = [
  { key: "1", label: "Type Check",              cmd: "npm run type-check",         desc: "Run TypeScript compiler checks" },
  { key: "2", label: "Build (dev)",             cmd: "npm run webpack",            desc: "Webpack development build" },
  { key: "3", label: "Build (production)",      cmd: "npm run build",              desc: "Type check + production build" },
  { key: "4", label: "Run Tests",               cmd: "npm test",                   desc: "Jest with coverage" },
  { key: "5", label: "Run Tests (quick)",       cmd: "npm run test:quick",         desc: "Only changed files" },
  { key: "6", label: "Run Tests (failed)",      cmd: "npm run test:failed",        desc: "Re-run failed tests only" },
  { key: "7", label: "Run Tests (coverage)",    cmd: null,                         desc: "Jest --coverage with summary", action: "test-coverage" },
  null, // separator
  { key: "8", label: "Package VSIX",            cmd: null,                         desc: "Package .vsix and show file info", action: "package-vsix" },
  { key: "9", label: "Publish to Marketplace",  cmd: null,                         desc: "Publish extension to VS Code marketplace", action: "publish" },
  { key: "10", label: "Install in VS Code",     cmd: "npm run install-extension",  desc: "Package + install extension", reload: true },
  { key: "11", label: "Clean Build & Install",  cmd: "npm run clean-build-install", desc: "Clean + bump + build + install", reload: true },
  null,
  { key: "o", label: "Open in VS Code",         cmd: `code "${root}"`,             desc: "Open project in VS Code" },
  { key: "r", label: "Reload VS Code Window",   cmd: null,                         desc: "Reload window to pick up changes", action: "reload-vscode" },
  { key: "u", label: "Uninstall old versions",  cmd: null,                         desc: "Remove all Clipster versions from VS Code", action: "uninstall" },
  null,
  { key: "v", label: "Version Bump",            cmd: "npx standard-version --no-verify", desc: "Bump version + changelog" },
  { key: "a", label: "Check Vulnerabilities",   cmd: null,                         desc: "Run npm audit for security issues", action: "audit" },
  { key: "s", label: "Git Status",              cmd: "git status",                 desc: "Show working tree status" },
  { key: "l", label: "Git Log (recent)",        cmd: "git log --oneline -15",      desc: "Last 15 commits" },
  null,
  { key: "q", label: "Quit",                    cmd: null,                         desc: "" },
];

// ── Reload Warning ──────────────────────────────────────────
async function showReloadWarning() {
  try {
    const { default: boxen } = await import("boxen");
    const { default: chalk } = await import("chalk");
    const msg =
      chalk.hex("#FFB020").bold("⚡ RELOAD REQUIRED\n") +
      "\n" +
      chalk.white("Extension was installed. To activate the new version:\n") +
      "\n" +
      chalk.hex("#FFD700")("  1. ") + chalk.white("Press ") + chalk.cyan.bold("Ctrl+Shift+P") + chalk.white(" in VS Code\n") +
      chalk.hex("#FFD700")("  2. ") + chalk.white("Type  ") + chalk.cyan.bold("Reload Window\n") +
      chalk.hex("#FFD700")("  3. ") + chalk.white("Press ") + chalk.cyan.bold("Enter\n") +
      "\n" +
      chalk.dim("Or press [r] in this menu to trigger it automatically.");
    console.log("\n" + boxen(msg, {
      padding: 1,
      borderStyle: "double",
      borderColor: "yellow",
    }) + "\n");
  } catch {
    // Fallback if boxen/chalk fail
    console.log(`\n${C.yellow}${C.bold}  ⚡ RELOAD REQUIRED — Press Ctrl+Shift+P → Reload Window${C.reset}\n`);
  }
}

// ── Helpers ─────────────────────────────────────────────────
function run(cmd, opts = {}) {
  console.log(`\n${C.cyan}${C.bold}> ${cmd}${C.reset}\n`);
  try {
    execSync(cmd, { stdio: "inherit", cwd: root, ...opts });
    console.log(`\n${C.green}${C.bold}Done.${C.reset}`);
  } catch (err) {
    console.log(`\n${C.red}${C.bold}Command failed (exit ${err.status}).${C.reset}`);
  }
}

function uninstallOldVersions() {
  console.log(`\n${C.yellow}Removing old Clipster versions from VS Code...${C.reset}\n`);
  try {
    const result = execSync("code --list-extensions", { cwd: root, encoding: "utf8" });
    const clipsterExts = result.split("\n").filter((e) => e.toLowerCase().includes("clipster"));
    if (clipsterExts.length === 0) {
      console.log(`${C.dim}No Clipster extensions found.${C.reset}`);
      return;
    }
    for (const ext of clipsterExts) {
      const name = ext.trim();
      if (!name) continue;
      console.log(`${C.amber}Removing: ${name}${C.reset}`);
      execSync(`code --uninstall-extension ${name}`, { stdio: "inherit", cwd: root });
    }
    console.log(`\n${C.green}${C.bold}Done. Restart VS Code to complete removal.${C.reset}`);
  } catch (err) {
    console.log(`${C.red}Failed: ${err.message}${C.reset}`);
  }
}

function reloadVSCode() {
  console.log(`\n${C.yellow}Sending reload command to VS Code...${C.reset}`);
  try {
    execSync('code --command "workbench.action.reloadWindow"', { stdio: "inherit", cwd: root });
    console.log(`${C.green}${C.bold}Reload triggered.${C.reset}`);
  } catch {
    console.log(`${C.dim}Could not trigger reload automatically.${C.reset}`);
    console.log(`${C.amber}Press Ctrl+Shift+P in VS Code and type "Reload Window"${C.reset}`);
  }
}

function packageVsix() {
  console.log(`\n${C.cyan}${C.bold}> npx @vscode/vsce package${C.reset}\n`);
  try {
    execSync("npx @vscode/vsce package", { stdio: "inherit", cwd: root });
    // Find the generated .vsix file
    const files = fs.readdirSync(root).filter((f) => f.endsWith(".vsix")).sort();
    if (files.length > 0) {
      const vsixFile = files[files.length - 1];
      const stats = fs.statSync(path.join(root, vsixFile));
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`\n${C.green}${C.bold}Packaged:${C.reset} ${C.white}${vsixFile}${C.reset} ${C.gray}(${sizeKB} KB)${C.reset}`);
    } else {
      console.log(`\n${C.green}${C.bold}Done.${C.reset}`);
    }
  } catch (err) {
    console.log(`\n${C.red}${C.bold}Packaging failed (exit ${err.status}).${C.reset}`);
  }
}

function publishToMarketplace(rl, callback) {
  rl.question(`${C.amber}${C.bold}  Are you sure? This publishes to VS Code marketplace [y/N]: ${C.reset}`, (answer) => {
    const confirmed = answer.trim().toLowerCase();
    if (confirmed === "y" || confirmed === "yes") {
      console.log(`\n${C.cyan}${C.bold}> npx @vscode/vsce publish${C.reset}\n`);
      try {
        execSync("npx @vscode/vsce publish", { stdio: "inherit", cwd: root });
        console.log(`\n${C.green}${C.bold}Published successfully!${C.reset}`);
      } catch (err) {
        console.log(`\n${C.red}${C.bold}Publish failed (exit ${err.status}).${C.reset}`);
      }
    } else {
      console.log(`${C.dim}  Publish cancelled.${C.reset}`);
    }
    callback();
  });
}

function runTestsWithCoverage() {
  console.log(`\n${C.cyan}${C.bold}> npx jest --coverage${C.reset}\n`);
  try {
    execSync("npx jest --coverage", { stdio: "inherit", cwd: root });
    console.log(`\n${C.green}${C.bold}Done.${C.reset}`);
  } catch (err) {
    console.log(`\n${C.red}${C.bold}Tests failed (exit ${err.status}).${C.reset}`);
  }
}

function checkVulnerabilities() {
  console.log(`\n${C.cyan}${C.bold}> npm audit${C.reset}\n`);
  try {
    execSync("npm audit", { stdio: "inherit", cwd: root });
    console.log(`\n${C.green}${C.bold}No vulnerabilities found.${C.reset}`);
  } catch (err) {
    // npm audit exits non-zero when vulnerabilities are found — that's expected
    console.log(`\n${C.amber}${C.bold}Audit complete. Review any issues above.${C.reset}`);
  }
}

// ── Render Menu ─────────────────────────────────────────────
function printMenu() {
  console.log("");
  for (const item of MENU) {
    if (item === null) {
      console.log(`${C.gray}    ${"─".repeat(52)}${C.reset}`);
      continue;
    }
    const key = `${C.gold}${C.bold} [${item.key}]${C.reset}`;
    const label = `${C.white}${item.label}${C.reset}`;
    const desc = item.desc ? `${C.gray}${item.desc}${C.reset}` : "";
    console.log(`  ${key}  ${label.padEnd(40)}${desc}`);
  }
  console.log("");
}

// ── Main Loop ───────────────────────────────────────────────
function prompt() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  function ask() {
    rl.question(`${C.gold}${C.bold}  clipster>${C.reset} `, async (answer) => {
      const choice = answer.trim().toLowerCase();

      if (choice === "q" || choice === "quit" || choice === "exit") {
        console.log(`\n${C.amber}Bye!${C.reset}\n`);
        rl.close();
        return;
      }

      if (choice === "m" || choice === "menu" || choice === "h" || choice === "help") {
        printLogo();
        printMenu();
        ask();
        return;
      }

      const item = MENU.find((m) => m && m.key === choice);
      if (!item) {
        console.log(`${C.dim}  Unknown option. Type 'm' for menu, 'q' to quit.${C.reset}`);
        ask();
        return;
      }

      if (item.action === "uninstall") {
        uninstallOldVersions();
      } else if (item.action === "reload-vscode") {
        reloadVSCode();
      } else if (item.action === "package-vsix") {
        packageVsix();
      } else if (item.action === "publish") {
        publishToMarketplace(rl, () => {
          printMenu();
          ask();
        });
        return;
      } else if (item.action === "test-coverage") {
        runTestsWithCoverage();
      } else if (item.action === "audit") {
        checkVulnerabilities();
      } else if (item.cmd) {
        run(item.cmd);
        if (item.reload) await showReloadWarning();
      }

      printMenu();
      ask();
    });
  }

  ask();
}

// ── Entry ───────────────────────────────────────────────────
printLogo();
printMenu();
prompt();
