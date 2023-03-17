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
    bash(`sudo launchctl unload net.beezwax.bzbond-server`);
    bash(`sudo launchctl load net.beezwax.bzbond-server`);
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
  console.log("Install bzBond server plugin");
  if (!name || !url) {
    ({ name, url } = await prompt.get(["name", "url"]));
  }
  if (!name || !url) return;

  const pluginsPath = path.resolve(__dirname, "../plugins.js");
  const file = await fs.readFile(pluginsPath, { encoding: "utf8" });
  const camelizedName = camelize(name);

  // Check if plugin is already installed, if so, update it instead
  const pluginDirectory = `/var/www/bzbond-server/installed-plugins/${name}`;
  if (existsSync(pluginDirectory)) {
    console.log(`The ${name} plugin is already installed. Updating...`);
    execSync(`sudo "${NODE_PATH}" "${NPM_PATH}" update ${url}`, {
      cwd: pluginDirectory,
    });
    restartServer();
    console.log("Done!");
    console.log(`Plugin ${name} updated`);
    return;
  }

  // run npm install
  if (url.startsWith("https://") || url.startsWith("ssh://")) {
    bash(
      `git clone ${url} /var/www/bzbond-server/installed-plugins/${name}`,
      `git config --global --add safe.directory /var/www/bzbond-server/installed-plugins/${name}`
    );
  } else {
    bash(`sudo cp -r ${url} /var/www/bzbond-server/installed-plugins/${name}`);
  }
  bash(
    `sudo "${NODE_PATH}" "${NPM_PATH}" i /var/www/bzbond-server/installed-plugins/${name}`
  );

  const importStatement = `
const {
  plugin: ${camelizedName}Plugin,
  options: ${camelizedName}Options,
} = require("${name}");
  `.trim();
  const pluginElement = `  { plugin: ${camelizedName}Plugin, options: ${camelizedName}Options },`;
  const body = file.replace(/\[([\s\S]*)\]/g, `[$1${pluginElement}\n]`);
  const newFile = `${importStatement}\n${body}`;

  await fs.writeFile(pluginsPath, newFile);

  restartServer();

  console.log(`Plugin ${name} installed`);
};

// Initialize
// =============================================================================
const [name, url] = process.argv.slice(2);
main(name, url);
