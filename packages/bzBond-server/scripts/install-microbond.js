const { execSync } = require("child_process");
const fs = require("fs/promises");
const { existsSync } = require("fs");
const path = require("path");
const prompt = require("prompt");
const { ArgumentParser } = require('argparse');

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
const main = async (name, url, proxy) => {
  console.log("Install bzBond server microbond");
  if (!name || !url) {
    ({ name, url } = await prompt.get(["name", "url"]));
  }
  if (!name || !url) return;

  const microbondsPath = path.resolve(__dirname, "../microbonds.js");
  const file = await fs.readFile(microbondsPath, { encoding: "utf8" });
  const camelizedName = camelize(name);

  // Check if microbond is already installed, if so, update it instead
  const microbondDirectory = IS_WINDOWS ? `C:\\Program Files\\bzBond-server\\installed-microbonds\\${name}`: `/var/www/bzbond-server/installed-microbonds/${name}`;
  if (existsSync(microbondDirectory)) {
    console.log(`The ${name} microbond is already installed. Updating...`);
    const npmCall = IS_WINDOWS ? NPM_PATH : `sudo "${NODE_PATH}" "${NPM_PATH}"`;
    execSync(`${npmCall} update ${url.split("/").pop()}`, {
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
      `git clone ${url} "${microbondDirectory}"${proxy ? ` --config http.proxy="${proxy}"` : ""}`,
      `git config --global --add safe.directory "${microbondDirectory}"`
    );
  } else {
    if (IS_WINDOWS) {
      bash(`Copy-Item -Path "${url}" -Destination "${microbondDirectory}" -Recurse -Force`);
    } else {
      bash(`sudo cp -r ${url} ${microbondDirectory}`);
    }
  }
  if (IS_WINDOWS) {
    bash(
      `${NPM_PATH} ${proxy ? `--proxy ${proxy} ` : ""}i --prefix "${microbondDirectory}"`,
      `${NPM_PATH} i ./installed-microbonds/${name}`
    );
  } else {
    bash(
      `sudo "${NODE_PATH}" "${NPM_PATH}" ${proxy ? `--proxy ${proxy} ` : ""}i --prefix "${microbondDirectory}"`,
      `sudo "${NODE_PATH}" "${NPM_PATH}" i ./installed-microbonds/${name}`
    );
  } 

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
const parser = new ArgumentParser({
  description: 'Microbond details'
});
parser.add_argument("-n", "--name", {nargs: "*"});
parser.add_argument("-u", "--url", {nargs: "*"});
parser.add_argument("-x", "--proxy", {nargs: "*"});
const { name: [name], url: [url], proxy: [proxy] } = parser.parse_args();
main(name, url, proxy);