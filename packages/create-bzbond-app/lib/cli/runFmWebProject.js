const performFmUrlScript = require("./performFmUrlScript");

module.exports = (repoName, port) => {
  const script = "bzBond Open Default Web Viewer In Debug Mode";
  const debugUrl = `http://localhost:${port}`;
  const scriptParameter = {webProject: repoName, debugUrl};
  performFmUrlScript(script, scriptParameter, repoName);
}