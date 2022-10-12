const path = require("path");
const http = require('http');
const openFmFile = require("./openFmFile");
const performFmUrlScript = require("./performFmUrlScript");

module.exports = (repoPath) => {

  const repoPathFull = path.resolve(repoPath);

  const { name: repoName } = path.parse(repoPath);

  const startingPort = 8080;
  let port = 0;
  const timeout = 20000;
  let lastCheck = 0;

  const run = async () => {
    process.stdout.write("\x1b[33mWaiting for web server...\x1b[0m");
    const start = Date.now();
    while (Date.now() - start < timeout && !port) {
      if(Date.now() - lastCheck > 999) {
        process.stdout.write("\x1b[33m.\x1b[0m");
        lastCheck = Date.now();
        for (let i = 0; i < 10; i++) {
          try {            
            const portFound = await checkForPort(startingPort + i);
            if(portFound) {
              port = startingPort + i;
              break;
            }
          } catch (error) {
            
          }
        }
      }
    }

    process.stdout.write("\n");

    if(port) {
      console.log("\x1b[33mWeb server ready\x1b[0m");
      openFmFile(repoPath).then(() => {
        const script = "bzBond Launch From Create bzBond App";
        const url = `file://${path.join(repoPathFull, "dist", "index.html")}`;
        const debugUrl = `http://localhost:${port}`;
        const scriptParameter = {
          webProject: repoName,
          url,
          debugUrl
        }
        setTimeout(() => performFmUrlScript(script, scriptParameter, repoName), 1000);
        setTimeout(() => console.log("\x1b[32mWeb project opened in FileMaker!\x1b[0m"), 2000);
      });
    } else {
      throw new Error("\x1b[91mCould not find hosted web project\x1b[0m");
    }
  }

  const checkForPort = (port) => {
    return new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:${port}`, res => {
        return resolve (res.headers.packagename === repoName);
      });

      req.on("error", (err) => {
        return reject (false);
      })
    });
  }

  run();
}