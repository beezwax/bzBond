const {exec, execSync} = require("child_process");
const path = require("path");
const fs = require("fs");
const deployAndRunFmWebProject = require("./deployAndRunFmWebProject");

module.exports = class CLI {

  configurePackageJson () {
    const packageJson = path.join(repoPath, 'package.json');
    const json = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    json.name = repoName;
    json.version = "0.1.0";
    json.private = true;
    fs.writeFileSync(packageJson, JSON.stringify(json, null, 2), 'utf8');
  }

  start ([repoPath]) {

    const repoPathObject = path.parse(repoPath);

    const { name: repoName } = repoPathObject;

    // Ensure repoName not empty
    if (!repoName) {
      console.error("Missing repo name: Proper format is create-bzbond-app <repo-name>");
      return;
    }

    // Create and run commands
    const commands = [
      new Command (`git clone --depth 1 https://github.com/beezwax/bzBond cbza-temp`, undefined, {message: `\x1b[33mCreating repo ${repoName}\x1b[0m`}),
      new Command (
        process.platform === "darwin" ?
          `mv cbza-temp/packages/bzBond-web-template ${repoPath} && mv cbza-temp/packages/bzBond-claris/bzBond-claris.fmp12 ${repoPath}/src/filemaker/${repoName}.fmp12 && rm -rf cbza-temp` :
          `move cbza-temp/packages/bzBond-web-template ${repoPath} && move cbza-temp/packages/bzBond-claris/bzBond-claris.fmp12 ${repoPath}/src/filemaker/${repoName}.fmp12 && rmdir /s /q cbza-temp`
      ),
      new Command (`cd ${repoPath} && npm install`),
      new FunctionCommand (() => {
        const packageJson = path.join(repoPath, 'package.json');
        const json = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
        json.name = repoName;
        json.version = "0.1.0";
        json.private = true;
        delete json.gitHead;
        delete json.publishConfig;
        fs.writeFileSync(packageJson, JSON.stringify(json, null, 2), 'utf8');
      }),
      new Command (process.platform === "darwin" ? `cd ${repoPath} && git add -A && git commit -m "Initial commit"` : `cd ${repoPath}`),
      new Command (`cd ${repoPath} && npm run start_silent`, undefined, {message: "\x1b[33mStarting Dev Server\x1b[0m", noWait: true}),
      new FunctionCommand (deployAndRunFmWebProject, [repoPath], {message: "\x1b[33mDeploying Web Project in FileMaker\x1b[0m"})
    ];
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
  }

  run () {
    try {
      if(this.message) {
        console.log(this.message);
      }
      this.execFunction(`${this.command}`, {stdio: "inherit"});
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