import build from "./app.js";
import plugins from "./plugins.js";

// Run the server!
const start = async () => {
  let app;

  try {
    app = await build({ plugins: await plugins() });
    await app.listen(8999);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
