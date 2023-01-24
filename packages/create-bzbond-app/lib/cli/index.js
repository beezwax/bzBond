const {exec, execSync} = require("child_process");
const path = require("path");
const fs = require("fs");
const deployAndRunFmWebProject = require("./deployAndRunFmWebProject");
const openFmFile = require("./openFmFile");

module.exports = class CLI {

  configurePackageJson () {
    const packageJson = path.join(repoPath, 'package.json');
    const json = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    json.name = repoName;
    json.version = "0.1.0";
    json.private = true;
    fs.writeFileSync(packageJson, JSON.stringify(json, null, 2), 'utf8');
  }

  start ([repoPath, ...options]) {

    const repoPathObject = path.parse(repoPath);

    const { name: repoName } = repoPathObject;

    // Ensure repoName not empty
    if (!repoName) {
      console.error("Missing repo name: Proper format is create-bzbond-app <repo-name>");
      return;
    }

    // Create and run commands
    let commands;
    if(options.some(option => option === "--web-only")) {
      commands = [
        new Command (`git clone --depth 1 https://github.com/beezwax/bzBond cbza-temp`, undefined, {message: `\x1b[33mCreating repo ${repoName}\x1b[0m`}),
        new Command (
          process.platform === "darwin" ?
            `mv cbza-temp/packages/bzBond-web-template ${repoPath} && rm -rf cbza-temp` :
            `move cbza-temp/packages/bzBond-web-template ${repoPath} && rmdir /s /q cbza-temp`
        ),
        new Command (`cd ${repoPath} && npm install`),
        new Command (`cd ${repoPath} && git init`),
        new FunctionCommand (() => {
          const packageJson = path.join(repoPath, 'package.json');
          const json = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
          json.name = repoName;
          json.version = "0.1.0";
          json.private = true;
          delete json.gitHead;
          delete json.publishConfig;
          delete json.author;
          delete json.description;
          fs.writeFileSync(packageJson, JSON.stringify(json, null, 2), 'utf8');
        }),
        new Command (process.platform === "darwin" ? `cd ${repoPath} && git add -A && git commit -m "Initial commit"` : `cd ${repoPath}`),
        new Command (`cd ${repoPath} && npm run start`, undefined, {message: "\x1b[33mStarting Dev Server\x1b[0m", noWait: true})
      ];
    } else if(options.some(option => option === "--claris-only")) {
      commands = [
        new Command (`git clone --depth 1 https://github.com/beezwax/bzBond cbza-temp`, undefined, {message: `\x1b[33mCreating repo ${repoName}\x1b[0m`}),
        new Command (
          process.platform === "darwin" ?
            `mv cbza-temp/packages/bzBond-claris ${repoPath} && mv ${repoPath}/bzBond-claris.fmp12 ${repoPath}/${repoName}.fmp12 && rm -rf cbza-temp` :
            `move cbza-temp/packages/bzBond-claris/bzBond-claris.fmp12 ${repoPath}/src/filemaker/${repoName}.fmp12 && rmdir /s /q cbza-temp`
        ),
        new Command (`cd ${repoPath} && npm install`),
        new Command (`cd ${repoPath} && git init`),
        new FunctionCommand (() => {
          const packageJson = path.join(repoPath, 'package.json');
          const json = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
          json.name = repoName;
          json.version = "0.1.0";
          json.private = true;
          delete json.gitHead;
          delete json.publishConfig;
          delete json.author;
          delete json.description;
          fs.writeFileSync(packageJson, JSON.stringify(json, null, 2), 'utf8');
        }),
        new Command (process.platform === "darwin" ? `cd ${repoPath} && git add -A && git commit -m "Initial commit"` : `cd ${repoPath}`),
        new FunctionCommand (openFmFile, [repoPath], {message: "\x1b[33mOpening Project in FileMaker\x1b[0m"})
      ];
    } else {
      commands = [
        new Command (`git clone --depth 1 https://github.com/beezwax/bzBond cbza-temp`, undefined, {message: `\x1b[33mCreating repo ${repoName}\x1b[0m`}),
        new Command (
          process.platform === "darwin" ?
            `mv cbza-temp/packages/bzBond-web-template ${repoPath} && mv cbza-temp/packages/bzBond-claris/bzBond-claris.fmp12 ${repoPath}/src/filemaker/${repoName}.fmp12 && rm -rf cbza-temp` :
            `move cbza-temp/packages/bzBond-web-template ${repoPath} && move cbza-temp/packages/bzBond-claris/bzBond-claris.fmp12 ${repoPath}/src/filemaker/${repoName}.fmp12 && rmdir /s /q cbza-temp`
        ),
        new Command (`cd ${repoPath} && npm install`),
        new Command (`cd ${repoPath} && git init`),
        new FunctionCommand (() => {
          const packageJson = path.join(repoPath, 'package.json');
          const json = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
          json.name = repoName;
          json.version = "0.1.0";
          json.private = true;
          delete json.gitHead;
          delete json.publishConfig;
          delete json.author;
          delete json.description;
          fs.writeFileSync(packageJson, JSON.stringify(json, null, 2), 'utf8');
        }),
        new Command (process.platform === "darwin" ? `cd ${repoPath} && git add -A && git commit -m "Initial commit"` : `cd ${repoPath}`),
        new Command (`cd ${repoPath} && npm run build`, undefined, {message: "\x1b[33mBuilding project...\x1b[0m", noWait: true, async: true, callback: () => {
          const commandsAfterBuild = [
            new Command (`cd ${repoPath} && npm run start_silent`, undefined, {message: "\x1b[33mStarting Dev Server\x1b[0m", noWait: true}),
            new FunctionCommand (deployAndRunFmWebProject, [repoPath], {message: "\x1b[33mDeploying Web Project in FileMaker\x1b[0m"})
          ];
          for(const command of commandsAfterBuild) {
            const error = command.run();
            if(error !== null) {
              console.error(`Failed to execute ${command.command}`, error);
              return;
            }
          }
        }})
      ];
    }
    for(const command of commands) {
      const error = command.run();
      if(error !== null) {
        console.error(`Failed to execute ${command.command}`, error);
        return;
      }
    }
  }
}

class Command {
  constructor(command, args, options = {}) {
    this.command = command;
    this.args = args ? args : [];
    this.execFunction = options.noWait ? exec : execSync;
    this.message = options.message ? options.message : "";
    this.waitMs = options.waitMs;
    this.async = options.async;
    this.callback = options.callback;
  }

  run () {
    try {
      if(this.message) {
        console.log(this.message);
      }
      if(this.async) {
        this.execFunction(`${this.command}`, this.callback, {stdio: "inherit"})
      } else {
        this.execFunction(`${this.command}`, {stdio: "inherit"});
      }
    } catch (e) {
      return e;
    }
    return null;
  }
}

class FunctionCommand extends Command {
  run() {
    try {
      if(this.message) {
        console.log(this.message);
      }
      if(this.waitMs) {
        setTimeout(() => this.command(...this.args), this.waitMs);
      } else {
        this.command(...this.args);
      };
    } catch (e) {
      return e;
    }
    return null;
  }
}