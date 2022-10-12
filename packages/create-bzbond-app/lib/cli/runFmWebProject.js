const performFmUrlScript = require("./performFmUrlScript");

module.exports = (repoName, port) => {
  const script = "FMBond Open Default Web Viewer In Debug Mode";
  const debugUrl = `http://localhost:${port}`;
  const scriptParameter = {webProject: repoName, debugUrl};
  performFmUrlScript(script, scriptParameter, repoName);
}