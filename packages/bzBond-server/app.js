import fastify from "fastify";
import routes from "./routes.js";
import plugins from "./plugins.js";

const DEFAULT_OPTIONS = {
  logger: true,
};

const build = async (options = DEFAULT_OPTIONS) => {
  const app = fastify(options);

  const installedPlugins = await plugins();
  installedPlugins.forEach((plugin) => app.register(plugin.default));

  app.register(routes);

  return app;
};

export default build;
