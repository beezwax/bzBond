const open = require("open");

module.exports = (script, scriptParameter, file) => {
  const scriptUrlEncoded = encodeURIComponent(script);
  const scriptParameterStringified = typeof scriptParameter === "object" ? JSON.stringify(scriptParameter) : scriptParameter;
  const scriptParameterUrlEncoded = encodeURIComponent(scriptParameterStringified);
  const scriptUrl = `fmp://$/${file}.fmp12?script=${scriptUrlEncoded}&param=${scriptParameterUrlEncoded}`;
  open(scriptUrl);
}