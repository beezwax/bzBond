const { execSync } = require("child_process");
const fs = require("fs/promises");
const path = require("path");
const prompt = require("prompt");

const camelize = (str) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );

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

const IS_DARWIN = process.platform === "darwin";

const main = async (name, url) => {
  console.log("Install bzBond server plugin");
  if (!name || !url) {
    { name, url } = await prompt.get(["name", "url"]);
  }
  if (!name || !url) return;

  // run npm install
  const [nodePath, npmPath] = TOOL_PATHS[process.platform];
  execSync(`sudo "${nodePath}" "${npmPath}" i ${url}`);

  // restart server
  if (IS_DARWIN) {
    execSync(`sudo launchctl stop net.beezwax.bzbond-server`);
    execSync(`sudo launchctl start net.beezwax.bzbond-server`);
  } else {
    execSync(`sudo systemctl restart bzbond-server`);
  }

  const pluginsPath = path.resolve(__dirname, "../plugins.js");
  const file = await fs.readFile(pluginsPath, { encoding: "utf8" });
  const camelizedName = camelize(name);
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

  execSync("sudo systemctl restart bzbond-server");
  console.log(`Plugin ${name} installed`);
};

const [name, url] = process.argv.slice(2);

main(name, url);
