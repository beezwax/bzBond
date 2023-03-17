const { execSync } = require("child_process");
const fs = require("fs/promises");
const { existsSync } = require("fs");
const path = require("path");
const prompt = require("prompt");

// Constants
// =============================================================================
const IS_DARWIN = process.platform === "darwin";
const TOOL_PATHS = {
  darwin: [
    "/Library/FileMaker Server/node/bin/node",
    "/Library/FileMaker Server/node/bin/npm",
  ],
  linux: [
    "/opt/FileMaker/FileMaker Server/node/bin/node",
    "/opt/FileMaker/FileMaker Server/node/bin/npm",
  ],
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
  } else {
    bash(`sudo systemctl restart bzbond-server`);
  }

  console.log("bzBond server restarted");
};

const bash = (...commands) => {
  commands.forEach((command) => {
    execSync(command, { cwd: "/var/www/bzbond-server" });
  });
};

// Main
// =============================================================================
const main = async (name, url) => {
  console.log("Install bzBond server microbond");
  if (!name || !url) {
    ({ name, url } = await prompt.get(["name", "url"]));
  }
  if (!name || !url) return;

  const microbondsPath = path.resolve(__dirname, "../microbonds.js");
  const file = await fs.readFile(microbondsPath, { encoding: "utf8" });
  const camelizedName = camelize(name);

  // Check if microbond is already installed, if so, update it instead
  const microbondDirectory = `/var/www/bzbond-server/installed-microbonds/${name}`;
  if (existsSync(microbondDirectory)) {
    console.log(`The ${name} microbond is already installed. Updating...`);
    execSync(`sudo "${NODE_PATH}" "${NPM_PATH}" update ${url.split("/").pop()}`, {
      cwd: microbondDirectory,
    });
    restartServer();
    console.log("Done!");
    console.log(`Microbond ${name} updated`);
    return;
  }

  // run npm install
  if (url.startsWith("https://") || url.startsWith("ssh://")) {
    bash(
      `git clone ${url} /var/www/bzbond-server/installed-microbonds/${name}`,
      `git config --global --add safe.directory /var/www/bzbond-server/installed-microbonds/${name}`
    );
  } else {
    bash(`sudo cp -r ${url} /var/www/bzbond-server/installed-microbonds/${name}`);
  }
  bash(
    `sudo "${NODE_PATH}" "${NPM_PATH}" i /var/www/bzbond-server/installed-microbonds/${name}`
  );

  const importStatement = `
const {
  microbond: ${camelizedName}Microbond,
  options: ${camelizedName}Options,
} = require("${name}");
  `.trim();
  const microbondElement = `  { microbond: ${camelizedName}Microbond, options: ${camelizedName}Options },`;
  const body = file.replace(/\[([\s\S]*)\]/g, `[$1${microbondElement}\n]`);
  const newFile = `${importStatement}\n${body}`;

  await fs.writeFile(microbondsPath, newFile);

  restartServer();

  console.log(`Microbond ${name} installed`);
};

// Initialize
// =============================================================================
const [name, url] = process.argv.slice(2);
main(name, url);
