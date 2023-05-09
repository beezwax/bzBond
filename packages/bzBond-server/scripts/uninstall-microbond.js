const { execSync } = require("child_process");
const fs = require("fs/promises");
const { existsSync } = require("fs");
const path = require("path");
const prompt = require("prompt");

// Constants
// =============================================================================
const IS_DARWIN = process.platform === "darwin";
const IS_WINDOWS = process.platform === "win32";
const TOOL_PATHS = {
  darwin: [
    "/Library/FileMaker Server/node/bin/node",
    "/Library/FileMaker Server/node/bin/npm",
  ],
  linux: [
    "/opt/FileMaker/FileMaker Server/node/bin/node",
    "/opt/FileMaker/FileMaker Server/node/bin/npm",
  ],
  win32: [
    "node",
    "npm"
  ]
};
const [NODE_PATH, NPM_PATH] = TOOL_PATHS[process.platform];

// Utilities
// =============================================================================
const camelize = (str) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );

const restartServer = () => {
  console.log("Restarting server...");

  if (IS_DARWIN) {
    bash(`sudo launchctl unload /Library/LaunchDaemons/net.beezwax.bzbond-server.plist`);
    bash(`sudo launchctl load /Library/LaunchDaemons/net.beezwax.bzbond-server.plist`);
  } else if (IS_WINDOWS) {
    bash(`Restart-Service -Name bzBond-server`);
  } else {
    bash(`sudo systemctl restart bzbond-server`);
  }

  console.log("bzBond server restarted");
};

const bash = (...commands) => {
  commands.forEach((command) => {
    const cwd = IS_WINDOWS ? "C:\\Program Files\\bzBond-server" : "/var/www/bzbond-server";
    const shell = IS_WINDOWS ? "powershell.exe" : undefined;
    execSync(command, { cwd, shell });
  });
};

// Main
// =============================================================================
const main = async (name) => {
  console.log("Uninstall bzBond server microbond");
  if (!name) {
    ({ name } = await prompt.get(["name"]));
  }
  if (!name) {
    console.log("Microbond name is required to uninstall");
    return;
  }

  const microbondsPath = path.resolve(__dirname, "../microbonds.js");
  const microBondsFile = await fs.readFile(microbondsPath, { encoding: "utf8" });
  const camelizedName = camelize(name);

  // Ensure microbond is installed
  const microbondDirectory = IS_WINDOWS ? `C:\\Program Files\\bzBond-server\\installed-microbonds\\${name}`: `/var/www/bzbond-server/installed-microbonds/${name}`;
  if (!existsSync(microbondDirectory)) {
    console.log(`Microbond "${name}" not found`);
    return;
  }

  // Edit microbonds.js file
  const reArray = [
    new RegExp (`const \\{\n  microbond: ${camelizedName}Microbond,\n  options: ${camelizedName}Options,\n} = require\\(("|')${name}("|')\\);\n`),
    new RegExp (`\n  { microbond: ${camelizedName}Microbond, options: ${camelizedName}Options },`)
  ];
  const newMicrobondsFile = reArray.reduce(
    (acc, curr) => acc.replace(curr, ""),
    microBondsFile
  );

  await fs.writeFile(microbondsPath, newMicrobondsFile);
  
  // Uninstall from app
  if (IS_WINDOWS) {
    bash(
      `${NPM_PATH} uninstall "${name}"`,
    );
  } else {
    bash(
      `sudo "${NODE_PATH}" "${NPM_PATH}" uninstall "${name}"`
    );
  }
  
  // Delete microbond folder
  if (IS_WINDOWS) {
    bash(`Remove-Item -Path "${microbondDirectory}" -Recurse -Force`);
  } else {
    bash(`sudo rm -rf "${microbondDirectory}"`);
  }

  // restart service
  restartServer();

};

// Initialize
// =============================================================================
const [name] = process.argv.slice(2);
main(name);