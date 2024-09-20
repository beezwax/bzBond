const build = require("./app.js");
const microbonds = require("./microbonds.js");

// Run the server!
const start = async () => {
  let app;

  try {
    app = await build({ microbonds: await microbonds() });
    await app.listen({port: 8999});
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
