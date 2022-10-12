const path = require("path");
const performFmUrlScript = require("./performFmUrlScript");

module.exports = (repoPath) => {

  const repoPathFull = path.resolve(repoPath);

  const { name: repoName } = path.parse(repoPath);

  const script = "bzBond Upsert Web Project";
  const url = `file://${path.join(repoPathFull, "dist", "index.html")}`;
  const scriptParameter = {webProject: repoName, url};
  performFmUrlScript(script, scriptParameter, repoName);
}