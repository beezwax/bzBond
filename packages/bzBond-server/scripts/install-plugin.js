const { execSync } = require("child_process");
const fs = require("fs/promises");
const prompt = require("prompt");

const camelize = (str) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );

const main = async () => {
  console.log("Install bzBond server plugin");
  const { name, url } = await prompt.get(["name", "url"]);
  if (!name || !url) return;

  const camelizedName = camelize(name);

  // TODO: support macOS
  const nodePath = "/opt/FileMaker/FileMaker Server/node/bin/node";
  const npmPath = "/opt/FileMaker/FileMaker Server/node/bin/npm";
  const ouput = execSync(`sudo "${nodePath}" "${npmPath}" i ${url}`);

  const file = await fs.readFile("plugins.js", { encoding: "utf8" });

  const importStatement = `
const {
  plugin: ${camelizedName}Plugin,
  options: ${camelizedName}Options,
} = require("${name}");
  `.trim();
  const pluginElement = `  { plugin: ${camelizedName}Plugin, options: ${camelizedName}Options },`;
  const body = file.replace(/\[([\s\S]*)\]/g, `[$1${pluginElement}\n]`);
  const newFile = `${importStatement}\n${body}`;

  await fs.writeFile("plugins.js", newFile);

  execSync("sudo systemctl restart bzbond-server");
};

main();
